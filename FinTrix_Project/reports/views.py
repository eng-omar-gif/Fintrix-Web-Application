from datetime import datetime, timedelta
from django.http import JsonResponse
from django.shortcuts import render
from django.db.models import Sum
from transactions.models import Income, Expense, Category


def reports_page(request):
    return render(request, "reports.html")


def report_summary_api(request):
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    if not start_date or not end_date:
        return JsonResponse({"error": "start_date and end_date are required"}, status=400)

    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

    incomes = Income.objects.filter(date__range=[start_date, end_date]).select_related("category")
    expenses = Expense.objects.filter(date__range=[start_date, end_date]).select_related("category")

    total_income = incomes.aggregate(total=Sum("amount"))["total"] or 0
    total_expense = expenses.aggregate(total=Sum("amount"))["total"] or 0

    # ---------- Weekly Chart Data ----------
    weekly_data = []
    current = start_date

    while current <= end_date:
        week_end = min(current + timedelta(days=6), end_date)

        week_income = incomes.filter(date__range=[current, week_end]).aggregate(total=Sum("amount"))["total"] or 0
        week_expense = expenses.filter(date__range=[current, week_end]).aggregate(total=Sum("amount"))["total"] or 0

        weekly_data.append({
            "label": f"{current.strftime('%b %d')} - {week_end.strftime('%b %d')}",
            "income": float(week_income),
            "expense": float(week_expense)
        })

        current = week_end + timedelta(days=1)

    # ---------- Expense Allocation ----------
    expense_allocation = []
    categories = Category.objects.filter(type="EXPENSE")

    for cat in categories:
        cat_total = expenses.filter(category=cat).aggregate(total=Sum("amount"))["total"] or 0
        if cat_total > 0:
            expense_allocation.append({
                "category": cat.name,
                "amount": float(cat_total)
            })

    expense_allocation.sort(key=lambda x: x["amount"], reverse=True)

    # ---------- Largest Transactions ----------
    largest_expenses = expenses.order_by("-amount")[:5]
    largest_incomes = incomes.order_by("-amount")[:5]

    largest_transactions = []

    for e in largest_expenses:
        largest_transactions.append({
            "entity": e.description,
            "category": e.category.name,
            "date": e.date.strftime("%b %d, %Y"),
            "amount": float(-e.amount),
            "status": "cleared"
        })

    for i in largest_incomes:
        largest_transactions.append({
            "entity": i.description,
            "category": i.category.name,
            "date": i.date.strftime("%b %d, %Y"),
            "amount": float(i.amount),
            "status": "cleared"
        })

    largest_transactions.sort(key=lambda x: abs(x["amount"]), reverse=True)
    largest_transactions = largest_transactions[:5]

    return JsonResponse({
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "weekly_chart": weekly_data,
        "expense_allocation": expense_allocation,
        "largest_transactions": largest_transactions
    })