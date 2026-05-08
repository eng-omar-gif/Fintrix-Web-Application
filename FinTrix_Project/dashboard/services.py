"""Aggregations and analytics for the main dashboard (transactions + budgets)."""
from __future__ import annotations

from calendar import monthrange
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from budgets.models import Budget
from goals.models import Goal
from transactions.models import Expense as TxExpense, Income


def _month_start(d: date) -> date:
    return date(d.year, d.month, 1)


def _add_months(d: date, delta: int) -> date:
    m = d.month - 1 + delta
    y = d.year + m // 12
    m = m % 12 + 1
    day = min(d.day, monthrange(y, m)[1])
    return date(y, m, day)


def _pct_change(current: Decimal, previous: Decimal) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return float((current - previous) / abs(previous) * 100)


def financial_snapshot(user=None) -> dict[str, Any]:
    """
    Build dashboard metrics from Income/Expense (global) and Budget/Goals.
    user: optional — used only for Goal aggregates.
    """
    today = timezone.now().date()
    month_start = _month_start(today)
    last_month_start = _add_months(month_start, -1)
    last_month_end = month_start - timedelta(days=1)

    inc_base = Income.objects.select_related("category")
    exp_base = TxExpense.objects.select_related("category")

    total_income_all = inc_base.aggregate(s=Sum("amount"))["s"] or Decimal("0")
    total_expense_all = exp_base.aggregate(s=Sum("amount"))["s"] or Decimal("0")
    total_balance = total_income_all - total_expense_all

    inc_m = inc_base.filter(date__gte=month_start, date__lte=today)
    exp_m = exp_base.filter(date__gte=month_start, date__lte=today)
    monthly_income = inc_m.aggregate(s=Sum("amount"))["s"] or Decimal("0")
    monthly_expense = exp_m.aggregate(s=Sum("amount"))["s"] or Decimal("0")

    inc_prev = inc_base.filter(date__gte=last_month_start, date__lte=last_month_end)
    exp_prev = exp_base.filter(date__gte=last_month_start, date__lte=last_month_end)
    prev_income = inc_prev.aggregate(s=Sum("amount"))["s"] or Decimal("0")
    prev_expense = exp_prev.aggregate(s=Sum("amount"))["s"] or Decimal("0")

    income_trend = _pct_change(monthly_income, prev_income)
    expense_trend = _pct_change(monthly_expense, prev_expense)
    balance_month_net = monthly_income - monthly_expense
    prev_net = prev_income - prev_expense
    balance_trend = _pct_change(balance_month_net, prev_net)

    # Expected income: trailing 3-month average of income (or previous month if empty)
    trail_start = _add_months(month_start, -3)
    trail_income = inc_base.filter(date__gte=trail_start, date__lt=month_start).aggregate(
        s=Sum("amount")
    )["s"] or Decimal("0")
    months_in_trail = 3
    expected_income = trail_income / Decimal(months_in_trail) if months_in_trail else Decimal("0")
    if expected_income == 0:
        expected_income = prev_income

    # Monthly overview: last 12 calendar months (income vs expense totals)
    overview_start = _add_months(month_start, -11)
    def _month_key(val) -> date:
        if val is None:
            return date.today()
        if hasattr(val, "date"):
            d = val.date()
        else:
            d = val
        return date(d.year, d.month, 1)

    inc_by_m = {
        _month_key(row["m"]): row["t"]
        for row in inc_base.filter(date__gte=overview_start)
        .annotate(m=TruncMonth("date"))
        .values("m")
        .annotate(t=Sum("amount"))
    }
    exp_by_m = {
        _month_key(row["m"]): row["t"]
        for row in exp_base.filter(date__gte=overview_start)
        .annotate(m=TruncMonth("date"))
        .values("m")
        .annotate(t=Sum("amount"))
    }
    monthly_overview: list[dict[str, Any]] = []
    for i in range(12):
        m0 = _add_months(overview_start, i)
        key = _month_start(m0)
        mi = inc_by_m.get(key) or Decimal("0")
        me = exp_by_m.get(key) or Decimal("0")
        monthly_overview.append(
            {
                "label": key.strftime("%b").upper(),
                "month_iso": key.isoformat(),
                "income": float(mi),
                "expense": float(me),
            }
        )

    # Category breakdown (expenses, current month)
    cat_rows = (
        exp_m.values("category_id", "category__name")
        .annotate(total=Sum("amount"))
        .order_by("-total")[:12]
    )
    category_expenses = [
        {"name": r["category__name"] or "—", "amount": float(r["total"] or 0)} for r in cat_rows
    ]
    donut_total = sum(c["amount"] for c in category_expenses)

    # Recent transactions (single round-trip: two sliced queries merged)
    recent_limit = 8
    incomes_recent = list(inc_base.order_by("-date", "-id")[:recent_limit])
    expenses_recent = list(exp_base.order_by("-date", "-id")[:recent_limit])
    combined: list[tuple[str, Any]] = [("income", o) for o in incomes_recent] + [
        ("expense", o) for o in expenses_recent
    ]
    combined.sort(key=lambda p: (p[1].date, p[1].pk), reverse=True)
    recent_transactions = []
    for kind, o in combined[:recent_limit]:
        is_inc = kind == "income"
        recent_transactions.append(
            {
                "kind": kind,
                "description": o.description or "—",
                "category": o.category.name if o.category else "—",
                "category_type": o.category.type if o.category else "",
                "date": o.date,
                "date_display": o.date.strftime("%b %d, %Y") if o.date else "",
                "amount": float(o.amount if is_inc else -o.amount),
            }
        )

    # Budget for this calendar month
    budget = (
        Budget.objects.filter(year=today.year, month__month=today.month)
        .prefetch_related(
            "category_budgets",
            "category_budgets__category",
        )
        .first()
    )
    budget_items: list[dict[str, Any]] = []
    total_limit = Decimal("0")
    total_spent_cb = Decimal("0")
    remaining_budget = Decimal("0")
    budget_utilization = 0.0

    if budget:
        cbs = list(budget.category_budgets.all())
        for cb in sorted(cbs, key=lambda x: -x.spent_amount)[:5]:
            lim = Decimal(str(cb.limit))
            spent = Decimal(str(cb.spent_amount))
            pct = float(spent / lim * 100) if lim > 0 else 0.0
            budget_items.append(
                {
                    "name": cb.category.name,
                    "spent": float(spent),
                    "limit": float(lim),
                    "pct": round(pct, 1),
                }
            )
            total_limit += lim
            total_spent_cb += spent
        remaining_budget = Decimal(str(budget.get_remaining()))
        if total_limit > 0:
            budget_utilization = float(total_spent_cb / total_limit * 100)
    else:
        remaining_budget = monthly_income - monthly_expense

    days_in_cycle = (date(today.year, today.month, monthrange(today.year, today.month)[1]) - today).days + 1

    methods = set(Income.objects.values_list("payment_method", flat=True).distinct())
    methods.update(TxExpense.objects.values_list("payment_method", flat=True).distinct())
    methods.discard(None)
    connected_accounts = max(1, min(len(methods), 8))

    goals_qs = Goal.objects.filter(user=user) if user and user.is_authenticated else Goal.objects.none()
    total_goal_target = goals_qs.aggregate(s=Sum("target_amount"))["s"] or Decimal("0")
    total_goal_saved = goals_qs.aggregate(s=Sum("current_savings"))["s"] or Decimal("0")

    savings_hint = monthly_income - monthly_expense
    on_track = savings_hint >= 0

    return {
        "today": today,
        "total_balance": total_balance,
        "monthly_income": monthly_income,
        "monthly_expense": monthly_expense,
        "expected_income": expected_income,
        "income_trend_pct": round(income_trend, 1),
        "expense_trend_pct": round(expense_trend, 1),
        "balance_trend_pct": round(balance_trend, 1),
        "monthly_overview": monthly_overview,
        "category_expenses": category_expenses,
        "category_expense_total": donut_total,
        "recent_transactions": recent_transactions,
        "budget_items": budget_items,
        "remaining_budget": remaining_budget,
        "budget_utilization_pct": round(budget_utilization, 1),
        "has_budget_period": budget is not None,
        "days_in_cycle": days_in_cycle,
        "connected_accounts": connected_accounts,
        "savings_month": savings_hint,
        "savings_on_track": on_track,
        "goals_saved_total": total_goal_saved,
        "goals_target_total": total_goal_target,
    }


def dashboard_json_payload(snapshot: dict[str, Any]) -> dict[str, Any]:
    """JSON-serializable subset for charts (embedded in template)."""
    mo = snapshot["monthly_overview"]
    return {
        "monthlyOverview": [
            {"label": x["label"], "income": x["income"], "expense": x["expense"]} for x in mo
        ],
        "categoryExpenses": snapshot["category_expenses"],
        "categoryTotal": snapshot["category_expense_total"],
    }
