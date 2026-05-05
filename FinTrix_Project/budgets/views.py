from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db import transaction
from datetime import date, datetime
from calendar import monthrange

from .models import (
    Budget,
    Category,
    CategoryBudget,
    Expense,
    Notification,
    NotificationController,
)

def create_budget(request):
    """
    Handles BudgetUI.inputBudgetData() + BudgetController.createBudget().
    Implements the full alt block from SD1.
    """
    if request.method == "POST":
        month_str      = request.POST.get("month")        # expects "YYYY-MM-DD"
        year_str       = request.POST.get("year")
        category_name  = request.POST.get("category_name", "").strip()
        limit_str      = request.POST.get("limit")

        # ── Step 1: parse & validate inputs ──────────────────────────────────
        try:
            month = datetime.strptime(month_str, "%Y-%m-%d").date()
            year  = month.year   # derive year from the date — avoids mismatch
            limit = float(limit_str)
        except (ValueError, TypeError):
            messages.error(request, "Invalid date or limit value.")
            return redirect("create_budget")

        if not category_name:
            messages.error(request, "Category name is required.")
            return redirect("create_budget")

        # ── Step 2: Budget.validate(limit > 0) ───────────────────────────────
        # (mirrors the validate() call in SD1 before checkBudgetExists)
        dummy_budget = Budget()
        if not dummy_budget.validate(limit):
            messages.error(request, "Limit must be greater than 0.")
            return redirect("create_budget")

        # ── Step 3: Budget.checkBudgetExists(month, year) ────────────────────
        # alt [Budget already exists] → Return Error: Conflict
        if Budget.check_budget_exists(month, year):
            messages.error(request, "Budget already exists for this month.")
            return redirect("create_budget")

        # ── Step 4: [Budget is unique and valid] ─────────────────────────────
        with transaction.atomic():
            # new Budget(month, year)
            budget = Budget.objects.create(month=month, year=year)

            # Category.findOrCreateCategory(name)
            category = Category.find_or_create_category(category_name)

            # budget.addCategoryLimit(category, limit)
            budget.add_category_limit(category, limit)

        # budget.getRemaining() → Return Success(budget)
        remaining = budget.get_remaining()
        messages.success(
            request,
            f"Budget created. Remaining: {remaining:.2f}"
        )

        # displayBudget() + showRemainingBudget() → Show updated Budget Screen
        return redirect("budget_detail", budget_id=budget.id)

    # GET — render BudgetUI input form (inputBudgetData())
    return render(request, "budgets/create_budget.html")

def budget_list(request):
    budgets = Budget.objects.all().order_by("-year", "-month")
    return render(request, "budgets/budget_list.html", {"budgets": budgets})


def budget_detail(request, budget_id):
    """
    Renders the full budget screen.
    Also the landing point for navigateToBudget() triggered from SD2.
    """
    budget         = get_object_or_404(Budget, id=budget_id)
    category_budgets = budget.category_budgets.select_related("category")

    categories   = []
    total_limit  = 0.0
    total_spent  = 0.0

    for cb in category_budgets:
        remaining  = cb.get_remaining()          # CategoryBudget.getRemaining()
        is_limited = cb.is_limited()             # CategoryBudget.isLimited()
        percentage = (
            (cb.spent_amount / cb.limit * 100) if cb.limit > 0 else 0
        )

        categories.append({
            "id":          cb.id,
            "name":        cb.category.name,
            "limit":       cb.limit,
            "spent_amount": cb.spent_amount,
            "remaining":   remaining,
            "percentage":  round(percentage, 1),
            "is_limited":  is_limited,
        })

        total_limit += cb.limit
        total_spent += cb.spent_amount

    # BudgetUI.showRemainingBudget() data
    global_utilization = (
        (total_spent / total_limit * 100) if total_limit > 0 else 0
    )
    estimated_savings = total_limit - total_spent

    # Days remaining in the budget's month
    today    = date.today()
    last_day = monthrange(budget.year, budget.month.month)[1]
    days_remaining = (
        last_day - today.day
        if (today.month == budget.month.month and today.year == budget.year)
        else 0
    )

    context = {
        "budget":              budget,
        "categories":          categories,
        "total_limit":         total_limit,
        "total_spent":         total_spent,
        "remaining":           budget.get_remaining(),   # Budget.getRemaining()
        "global_utilization":  round(global_utilization, 1),
        "estimated_savings":   estimated_savings,
        "days_remaining":      days_remaining,
    }

    return render(request, "budgets/budget_detail.html", context)


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

        # Category.findOrCreateCategory(name)
        category = Category.find_or_create_category(category_name)

        try:
            # budget.addCategoryLimit(category, limit) — validates limit > 0
            budget.add_category_limit(category, limit)
            messages.success(request, f"Category '{category_name}' added.")
        except ValueError as e:
            messages.error(request, str(e))

        return redirect("budget_detail", budget_id=budget.id)

    return render(request, "budgets/add_category.html", {"budget": budget})


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

        # Locate the CategoryBudget for this category within this budget
        category = get_object_or_404(Category, name=category_name)
        cb = get_object_or_404(
            CategoryBudget,
            budget=budget,
            category=category,
        )

        with transaction.atomic():
            # BudgetController.addExpense(expense) — create the Expense record
            expense = Expense.objects.create(
                category_budget=cb,
                amount=amount,
                date=expense_date,
            )

            # BudgetController.updateBudget(expense)
            # → CategoryBudget.updateSpent(amount)
            # → NotificationController.checkThreshold(cb)  [inside update_spent]
            cb.update_spent(expense.amount)

        messages.success(request, f"Expense of {amount:.2f} added to '{category_name}'.")
        return redirect("budget_detail", budget_id=budget.id)

    # GET — show expense form pre-filtered to this budget's categories
    category_budgets = budget.category_budgets.select_related("category")
    return render(request, "budgets/add_expense.html", {
        "budget": budget,
        "category_budgets": category_budgets,
    })

# 🔹 Budget Dashboard — maps to BudgetUI.displayBudget() (home screen)
def budget_dashboard(request):
    budgets = Budget.objects.all().order_by("-year", "-month")

    dashboard_data = []
    for budget in budgets:
        dashboard_data.append({
            "budget":     budget,
            "remaining":  budget.get_remaining(),
            "total_spent": budget.get_total_spent(),
        })

    unread_count = Notification.objects.filter(is_read=False).count()

    return render(request, "budgets/budget_dashboard.html", {
        "dashboard_data": dashboard_data,
        "unread_count":   unread_count,
    })

def notification_center(request):
    """
    Maps to NotificationUI requesting all notifications (SD2).
    Re-runs checkThreshold across all CategoryBudgets so the list is fresh.
    """
    # NotificationController.checkThreshold() for every active CategoryBudget
    for cb in CategoryBudget.objects.select_related("category", "budget").all():
        NotificationController.check_threshold(cb)

    # Fetch all notifications — unread first (mirrors SD2 "unread highlighted")
    notifications = (
        Notification.objects.select_related(
            "category_budget__category",
            "category_budget__budget",
        )
        .order_by("is_read", "-created_at")
    )

    context = {
        "notifications":       notifications,
        "has_notifications":   notifications.exists(),  # drives alt/else in SD2
        "unread_count":        notifications.filter(is_read=False).count(),
    }

    return render(request, "notifications/notification_center.html", context)


def mark_as_read(request, notification_id):
    """
    Implements NotificationController.markAsRead(notificationId) from SD2.
    """
    if request.method == "POST":
        NotificationController.mark_as_read(notification_id)
        messages.success(request, "Notification marked as read.")

    return redirect("notification_center")


def navigate_to_budget_from_notification(request, notification_id):
    """
    Implements the opt block in SD2.
    Fetches the related Budget via notificationId → navigates to budget screen.
    """
    notification = get_object_or_404(Notification, id=notification_id)

    # BudgetController.fetchRelatedBudget(notificationId)
    # Traverse: Notification → CategoryBudget → Budget
    related_budget = notification.category_budget.budget

    # Mark as read on navigation (natural UX and matches SD2 flow order)
    NotificationController.mark_as_read(notification_id)

    # BudgetUI.navigateToBudget() → Show budget screen
    return redirect("budget_detail", budget_id=related_budget.id)