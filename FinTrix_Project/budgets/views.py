from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db import transaction
from datetime import date, datetime
from calendar import monthrange

from .models import Budget, Category, CategoryBudget, Expense


# ── Budget Dashboard ──────────────────────────────────────────────────────────
def budget_dashboard(request):
    budgets = Budget.objects.all().order_by("-year", "-month")

    dashboard_data = []
    for budget in budgets:
        dashboard_data.append({
            "budget":      budget,
            "remaining":   budget.get_remaining(),
            "total_spent": budget.get_total_spent(),
        })

    return render(request, "Budget.html", {
        "dashboard_data": dashboard_data,
    })


# ── Create Budget (SD1) ───────────────────────────────────────────────────────
def create_budget(request):
    if request.method == "POST":
        month_str     = request.POST.get("month")
        category_name = request.POST.get("category_name", "").strip()
        limit_str     = request.POST.get("limit")

        try:
            month = datetime.strptime(month_str, "%Y-%m-%d").date()
            year  = month.year
            limit = float(limit_str)
        except (ValueError, TypeError):
            messages.error(request, "Invalid date or limit value.")
            return redirect("create_budget")

        if not category_name:
            messages.error(request, "Category name is required.")
            return redirect("create_budget")

        # Budget.validate(limit > 0)
        if not Budget().validate(limit):
            messages.error(request, "Limit must be greater than 0.")
            return redirect("create_budget")

        # Budget.checkBudgetExists(month, year)
        if Budget.check_budget_exists(month, year):
            messages.error(request, "Budget already exists for this month.")
            return redirect("create_budget")

        with transaction.atomic():
            budget   = Budget.objects.create(month=month, year=year)
            category = Category.find_or_create_category(category_name)
            budget.add_category_limit(category, limit)

        messages.success(request, f"Budget created. Remaining: {budget.get_remaining():.2f}")
        return redirect("budget_detail", budget_id=budget.id)

    return render(request, "Budget.html")


# ── Budget List ───────────────────────────────────────────────────────────────
def budget_list(request):
    budgets = Budget.objects.all().order_by("-year", "-month")
    return render(request, "Budget.html", {"budgets": budgets})


# ── Budget Detail ─────────────────────────────────────────────────────────────
def budget_detail(request, budget_id):
    budget           = get_object_or_404(Budget, id=budget_id)
    category_budgets = budget.category_budgets.select_related("category")

    categories  = []
    total_limit = 0.0
    total_spent = 0.0

    for cb in category_budgets:
        percentage = (cb.spent_amount / cb.limit * 100) if cb.limit > 0 else 0
        expenses = list(cb.expenses.order_by("-date").values("id", "amount", "date"))

        categories.append({
            "id":           cb.id,
            "name":         cb.category.name,
            "limit":        cb.limit,
            "spent_amount": cb.spent_amount,
            "remaining":    cb.get_remaining(),
            "percentage":   round(percentage, 1),
            "is_limited":   cb.is_limited(),
            "expenses":     expenses,
        })
        total_limit += cb.limit
        total_spent += cb.spent_amount

    global_utilization = (total_spent / total_limit * 100) if total_limit > 0 else 0
    today    = date.today()
    last_day = monthrange(budget.year, budget.month.month)[1]
    days_remaining = (
        last_day - today.day
        if (today.month == budget.month.month and today.year == budget.year)
        else 0
    )

    return render(request, "Budget.html", {
        "budget":             budget,
        "categories":         categories,
        "total_limit":        total_limit,
        "total_spent":        total_spent,
        "remaining":          budget.get_remaining(),
        "global_utilization": round(global_utilization, 1),
        "estimated_savings":  total_limit - total_spent,
        "days_remaining":     days_remaining,
    })


# ── Add Category Limit ────────────────────────────────────────────────────────
def add_category_limit(request, budget_id):
    budget = get_object_or_404(Budget, id=budget_id)

    if request.method == "POST":
        category_name = request.POST.get("category_name", "").strip()
        limit_str     = request.POST.get("limit")

        try:
            limit = float(limit_str)
        except (ValueError, TypeError):
            messages.error(request, "Invalid limit value.")
            return redirect("budget_detail", budget_id=budget.id)

        if not category_name:
            messages.error(request, "Category name is required.")
            return redirect("budget_detail", budget_id=budget.id)

        category = Category.find_or_create_category(category_name)

        try:
            budget.add_category_limit(category, limit)
            messages.success(request, f"Category '{category_name}' added.")
        except ValueError as e:
            messages.error(request, str(e))

        return redirect("budget_detail", budget_id=budget.id)

    return render(request, "Budget.html", {"budget": budget})


# ── Add Expense ───────────────────────────────────────────────────────────────
def add_expense(request, budget_id):
    budget = get_object_or_404(Budget, id=budget_id)

    if request.method == "POST":
        category_name = request.POST.get("category_name", "").strip()
        amount_str    = request.POST.get("amount")
        date_str      = request.POST.get("date")

        try:
            amount       = float(amount_str)
            expense_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            messages.error(request, "Invalid amount or date.")
            return redirect("budget_detail", budget_id=budget_id)

        if amount <= 0:
            messages.error(request, "Expense amount must be greater than 0.")
            return redirect("budget_detail", budget_id=budget_id)

        if not category_name:
            messages.error(request, "Category is required.")
            return redirect("budget_detail", budget_id=budget_id)

        category = get_object_or_404(Category, name=category_name)
        cb       = get_object_or_404(CategoryBudget, budget=budget, category=category)

        with transaction.atomic():
            expense = Expense.objects.create(
                category_budget=cb,
                amount=amount,
                date=expense_date,
            )
            cb.update_spent(expense.amount)

        messages.success(request, f"Expense of {amount:.2f} added to '{category_name}'.")
        return redirect("budget_detail", budget_id=budget.id)

    return render(request, "Budget.html", {
        "budget":           budget,
        "category_budgets": budget.category_budgets.select_related("category"),
    })

# ── Edit Category Limit ───────────────────────────────────────────────────────
def edit_category_limit(request, budget_id, cb_id):
    cb = get_object_or_404(CategoryBudget, id=cb_id, budget_id=budget_id)

    if request.method == "POST":
        limit_str = request.POST.get("limit")
        try:
            limit = float(limit_str)
        except (ValueError, TypeError):
            messages.error(request, "Invalid limit value.")
            return redirect("budget_detail", budget_id=budget_id)

        if not cb.budget.validate(limit):
            messages.error(request, "Limit must be greater than 0.")
            return redirect("budget_detail", budget_id=budget_id)

        cb.limit = limit
        cb.save(update_fields=["limit"])
        messages.success(request, f"Limit for '{cb.category.name}' updated.")

    return redirect("budget_detail", budget_id=budget_id)


# ── Delete Category ───────────────────────────────────────────────────────────
def delete_category(request, budget_id, cb_id):
    cb = get_object_or_404(CategoryBudget, id=cb_id, budget_id=budget_id)

    if request.method == "POST":
        name = cb.category.name
        cb.delete()
        messages.success(request, f"'{name}' removed from budget.")

    return redirect("budget_detail", budget_id=budget_id)