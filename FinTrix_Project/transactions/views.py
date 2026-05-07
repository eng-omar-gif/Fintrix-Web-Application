import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render

def transactions_page(request):
    return render(request, 'transactions.html')

@csrf_exempt
@require_POST
def add_transaction(request):
    from .services import TransactionService
    from .repositories import TransactionRepository
    transaction_repository = TransactionRepository()
    transaction_service = TransactionService(transaction_repository)

    data = json.loads(request.body)
    print("DEBUG DATA:", data)  # تتبع مؤقت، امسحه بعد ما يشتغل
    result = transaction_service.process_transaction(data)
    if result:
        return JsonResponse({"message": "Done!"}, status=201)
    else:
        return JsonResponse({"error": "Bad Data"}, status=400)

@require_GET
def list_transactions(request):
    from .services import TransactionService
    from .repositories import TransactionRepository
    transaction_repository = TransactionRepository()
    transaction_service = TransactionService(transaction_repository)

    cat_id = request.GET.get('category_id')
    start = request.GET.get('start_date')
    end = request.GET.get('end_date')
    t_type = request.GET.get('type')

    if cat_id:
        transactions = transaction_service.get_by_category(cat_id)
    elif start and end:
        transactions = transaction_service.get_by_date_range(start, end)
    elif t_type:
        transactions = transaction_service.get_by_type(t_type)
    else:
        transactions = transaction_service.get_all_transactions()

    data = []
    for t in transactions:
        data.append({
            "id": t.pk,
            "type": "Income" if hasattr(t, 'source') else "Expense",
            "amount": float(t.amount),
            "description": t.description,
            "date": t.date.isoformat(),
            "category": t.category.name if t.category else None,
            "payment_method": t.payment_method,  # أضفناه
        })
    return JsonResponse(data, safe=False)
