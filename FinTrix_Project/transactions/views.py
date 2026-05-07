import csv
import json
from datetime import date
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect

from .models import Category, CategoryType, Income, Expense

def transactions_page(request):
    return render(request, 'transactions.html')

@require_POST
@csrf_protect
def add_transaction(request):
    from .services import TransactionService
    from .repositories import TransactionRepository
    transaction_repository = TransactionRepository()
    transaction_service = TransactionService(transaction_repository)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
     
    result = transaction_service.process_transaction(data)
    if result:
        return JsonResponse({"message": "Done!"}, status=201)
    else:
        return JsonResponse({"error": "Bad Data"}, status=400)

@require_GET
def list_transactions(request):
    cat_id = request.GET.get('category_id')
    start = request.GET.get('start_date')
    end = request.GET.get('end_date')
    t_type = (request.GET.get('type') or '').lower().strip()

    page = int(request.GET.get('page') or 1)
    page_size = int(request.GET.get('page_size') or 10)

    incomes = Income.objects.select_related('category').all()
    expenses = Expense.objects.select_related('category').all()

    if cat_id:
        incomes = incomes.filter(category_id=cat_id)
        expenses = expenses.filter(category_id=cat_id)

    if start:
        incomes = incomes.filter(date__gte=start)
        expenses = expenses.filter(date__gte=start)
    if end:
        incomes = incomes.filter(date__lte=end)
        expenses = expenses.filter(date__lte=end)

    if t_type == 'income':
        expenses = Expense.objects.none()
    elif t_type == 'expense':
        incomes = Income.objects.none()
    elif t_type in ('internal', 'internal_transfer', 'transfer'):
        incomes = Income.objects.none()
        expenses = Expense.objects.none()

    combined = []
    for inc in incomes:
        combined.append(("income", inc))
    for exp in expenses:
        combined.append(("expense", exp))

    combined.sort(key=lambda pair: (pair[1].date, pair[1].pk), reverse=True)

    def serialize(tx_kind, obj):
        is_income = tx_kind == "income"
        return {
            "id": obj.pk,
            "kind": tx_kind,
            "type": "Income" if is_income else "Expense",
            "amount": float(obj.amount),
            "description": obj.description,
            "date": obj.date.isoformat() if obj.date else None,
            "category": obj.category.name if obj.category else None,
            "category_id": obj.category_id,
            "payment_method": obj.payment_method,
            "source": getattr(obj, "source", "") if is_income else "",
        }

    paginator = Paginator(combined, page_size)
    page_obj = paginator.get_page(page)

    items = [serialize(k, o) for (k, o) in page_obj.object_list]

    net_flow = 0.0
    for (k, o) in combined:
        amt = float(o.amount)
        net_flow += amt if k == "income" else -amt

    return JsonResponse(
        {
            "transactions": items,
            "page": page_obj.number,
            "page_size": page_size,
            "total": paginator.count,
            "total_pages": paginator.num_pages,
            "net_flow": net_flow,
        }
    )


@require_GET
def list_categories(request):
    if not Category.objects.exists():
        defaults = [
            ("Salary", CategoryType.INCOME),
            ("Freelance", CategoryType.INCOME),
            ("Investments", CategoryType.INCOME),
            ("Other Income", CategoryType.INCOME),
            ("Food", CategoryType.EXPENSE),
            ("Transportation", CategoryType.EXPENSE),
            ("Housing", CategoryType.EXPENSE),
            ("Entertainment", CategoryType.EXPENSE),
            ("Others", CategoryType.EXPENSE),
            ("Technology", CategoryType.EXPENSE),
            ("Equipment", CategoryType.EXPENSE),
            ("Operations", CategoryType.EXPENSE),
            ("Service Income", CategoryType.INCOME),
        ]
        Category.objects.bulk_create([Category(name=n, type=t) for (n, t) in defaults])

    cats = Category.objects.all().order_by('type', 'name')
    data = [{"id": c.id, "name": c.name, "type": c.type} for c in cats]
    return JsonResponse({"categories": data})


@require_http_methods(["DELETE"])
@csrf_protect
def delete_transaction(request, tx_type, tx_id):
    tx_type = (tx_type or "").lower().strip()
    if tx_type == "income":
        model = Income
    elif tx_type == "expense":
        model = Expense
    else:
        return JsonResponse({"error": "Unknown transaction type"}, status=400)

    deleted, _ = model.objects.filter(pk=tx_id).delete()
    if deleted:
        return JsonResponse({"message": "Deleted"})
    return JsonResponse({"error": "Not found"}, status=404)


@require_GET
def export_transactions_csv(request):
    cat_id = request.GET.get('category_id')
    start = request.GET.get('start_date')
    end = request.GET.get('end_date')
    t_type = (request.GET.get('type') or '').lower().strip()

    incomes = Income.objects.select_related('category').all()
    expenses = Expense.objects.select_related('category').all()

    if cat_id:
        incomes = incomes.filter(category_id=cat_id)
        expenses = expenses.filter(category_id=cat_id)
    if start:
        incomes = incomes.filter(date__gte=start)
        expenses = expenses.filter(date__gte=start)
    if end:
        incomes = incomes.filter(date__lte=end)
        expenses = expenses.filter(date__lte=end)

    if t_type == 'income':
        expenses = Expense.objects.none()
    elif t_type == 'expense':
        incomes = Income.objects.none()
    elif t_type in ('internal', 'internal_transfer', 'transfer'):
        incomes = Income.objects.none()
        expenses = Expense.objects.none()

    combined = []
    for inc in incomes:
        combined.append(("income", inc))
    for exp in expenses:
        combined.append(("expense", exp))
    combined.sort(key=lambda pair: (pair[1].date, pair[1].pk), reverse=True)

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="transactions_{date.today().isoformat()}.csv"'

    writer = csv.writer(response)
    writer.writerow(["Date", "Type", "Description", "Category", "Method", "Amount", "Source"])

    for kind, obj in combined:
        writer.writerow(
            [
                obj.date.isoformat() if obj.date else "",
                "Income" if kind == "income" else "Expense",
                obj.description or "",
                obj.category.name if obj.category else "",
                obj.payment_method or "",
                str(obj.amount),
                getattr(obj, "source", "") if kind == "income" else "",
            ]
        )

    return response