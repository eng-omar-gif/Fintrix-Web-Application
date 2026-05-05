from django.shortcuts import render, redirect, get_object_or_404
from .models import Budget, Category
from django.contrib import messages
from datetime import date, datetime
from calendar import monthrange


# 🔹 Create Budget
def create_budget(request):
    if request.method == "POST":
        month_str = request.POST.get("month")  # format: YYYY-MM-DD
        year = request.POST.get("year")

        try:
            month = datetime.strptime(month_str, "%Y-%m-%d").date()
            year = int(year)
        except:
            messages.error(request, "Invalid date")
            return redirect("create_budget")

        if Budget.check_budget_exists(month, year):
            messages.error(request, "Budget already exists for this month")
            return redirect("create_budget")

        Budget.objects.create(month=month, year=year)
        messages.success(request, "Budget created successfully")
        return redirect("budget_list")

    return render(request, "budgets/create_budget.html")


# 🔹 List Budgets
def budget_list(request):
    budgets = Budget.objects.all()
    return render(request, "budgets/budget_list.html", {"budgets": budgets})


# 🔹 Budget Details
def budget_detail(request, budget_id):
    budget = get_object_or_404(Budget, id=budget_id)
    category_budgets = budget.categories.select_related('category')

    categories = []
    total_limit = 0
    total_spent = 0

    for cb in category_budgets:
        remaining = cb.limit - cb.spent_amount
        percentage = (cb.spent_amount / cb.limit * 100) if cb.limit > 0 else 0

        categories.append({
            "name": cb.category.name,
            "limit": cb.limit,
            "spent_amount": cb.spent_amount,
            "remaining": remaining,
            "percentage": round(percentage, 1),
            "category_type": "Fixed"
        })

        total_limit += cb.limit
        total_spent += cb.spent_amount

    global_utilization = (total_spent / total_limit * 100) if total_limit > 0 else 0
    estimated_savings = total_limit - total_spent

    today = date.today()
    last_day = monthrange(budget.year, budget.month.month)[1]

    if today.month == budget.month.month and today.year == budget.year:
        days_remaining = last_day - today.day
    else:
        days_remaining = 0

    context = {
        "budget": budget,
        "categories": categories,
        "total_limit": total_limit,
        "global_utilization": round(global_utilization, 1),
        "estimated_savings": estimated_savings,
        "days_remaining": days_remaining,
    }

    return render(request, "budgets/Budget.html", context)


# 🔹 Add Category Limit
def add_category_limit(request, budget_id):
    budget = get_object_or_404(Budget, id=budget_id)

    if request.method == "POST":
        category_name = request.POST.get("category_name")  # ✅ FIXED
        limit_str = request.POST.get("limit")

        try:
            limit = float(limit_str)
        except:
            messages.error(request, "Invalid limit value")
            return redirect("budget_detail", budget_id=budget.id)

        if not category_name:
            messages.error(request, "Category is required")
            return redirect("budget_detail", budget_id=budget.id)

        category, _ = Category.objects.get_or_create(name=category_name)

        try:
            budget.add_category_limit(category, limit)
            messages.success(request, "Category added successfully")
        except ValueError as e:
            messages.error(request, str(e))

        return redirect("budget_detail", budget_id=budget.id)

    return render(request, "budgets/add_category.html", {"budget": budget})