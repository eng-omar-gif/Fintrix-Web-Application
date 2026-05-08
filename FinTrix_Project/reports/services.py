"""Shared report aggregations for API and file exports."""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from django.db.models import Sum
from transactions.models import Expense, Income


def build_report_payload(
    start_date: date,
    end_date: date,
    category_id: int | None = None,
) -> dict[str, Any]:
    incomes = Income.objects.filter(date__range=[start_date, end_date]).select_related("category")
    expenses = Expense.objects.filter(date__range=[start_date, end_date]).select_related("category")

    if category_id:
        incomes = incomes.filter(category_id=category_id)
        expenses = expenses.filter(category_id=category_id)

    total_income_dec = incomes.aggregate(t=Sum("amount"))["t"] or Decimal("0")
    total_expense_dec = expenses.aggregate(t=Sum("amount"))["t"] or Decimal("0")
    total_income = float(total_income_dec)
    total_expense = float(total_expense_dec)

    weekly_data: list[dict[str, Any]] = []
    current = start_date
    while current <= end_date:
        week_end = min(current + timedelta(days=6), end_date)
        w_inc = incomes.filter(date__range=[current, week_end]).aggregate(t=Sum("amount"))["t"] or Decimal("0")
        w_exp = expenses.filter(date__range=[current, week_end]).aggregate(t=Sum("amount"))["t"] or Decimal("0")
        weekly_data.append(
            {
                "label": f"{current.strftime('%b %d')} – {week_end.strftime('%b %d')}",
                "income": float(w_inc),
                "expense": float(w_exp),
            }
        )
        current = week_end + timedelta(days=1)

    expense_allocation: list[dict[str, Any]] = []
    for row in (
        expenses.values("category_id", "category__name")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    ):
        t = row["total"] or Decimal("0")
        if t > 0:
            expense_allocation.append(
                {"category": row["category__name"] or "—", "amount": float(t)}
            )

    largest_transactions: list[dict[str, Any]] = []
    for e in expenses.order_by("-amount")[:10]:
        largest_transactions.append(
            {
                "entity": e.description,
                "category": e.category.name if e.category else "",
                "date": e.date.strftime("%b %d, %Y"),
                "date_iso": e.date.isoformat(),
                "amount": float(-e.amount),
                "status": "cleared",
            }
        )
    for i in incomes.order_by("-amount")[:10]:
        largest_transactions.append(
            {
                "entity": i.description,
                "category": i.category.name if i.category else "",
                "date": i.date.strftime("%b %d, %Y"),
                "date_iso": i.date.isoformat(),
                "amount": float(i.amount),
                "status": "cleared",
            }
        )

    largest_transactions.sort(key=lambda x: abs(x["amount"]), reverse=True)
    largest_transactions = largest_transactions[:10]

    return {
        "period_start": start_date.isoformat(),
        "period_end": end_date.isoformat(),
        "total_income": total_income,
        "total_expense": total_expense,
        "net": total_income - total_expense,
        "weekly_chart": weekly_data,
        "expense_allocation": expense_allocation,
        "largest_transactions": largest_transactions,
    }
