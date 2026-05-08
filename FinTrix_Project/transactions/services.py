from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from django.utils import timezone

from .models import Category, Expense, Income, PaymentMethod


_VALID_PAYMENT = {c.value for c in PaymentMethod}


def _parse_tx_date(val):
    if val is None or val == "":
        return timezone.now().date()
    if isinstance(val, date):
        return val
    s = str(val).strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(s.replace("Z", "")[:19]).date()
    except ValueError:
        pass
    return timezone.now().date()


class TransactionService:

    def __init__(self, transaction_repository):
        self.repository = transaction_repository

    def validate_transaction(self, data):
        try:
            amount = Decimal(str(data.get("amount", 0)))
        except (InvalidOperation, TypeError, ValueError):
            return False

        if amount <= 0:
            return False

        if data.get("type", "").upper() not in ("INCOME", "EXPENSE"):
            return False

        cid = data.get("category_id", data.get("category"))
        if not cid or not Category.objects.filter(id=cid).exists():
            return False

        return True

    def create_transaction(self, data):
        category = Category.objects.get(id=data.get("category_id", data.get("category")))
        payment = (data.get("payment_method") or PaymentMethod.CASH).upper()
        if payment not in _VALID_PAYMENT:
            payment = PaymentMethod.CASH

        amount = Decimal(str(data["amount"]))
        tx_date = _parse_tx_date(data.get("date"))

        if data["type"].upper() == "INCOME":
            transaction = Income(
                amount=amount,
                description=data.get("description", "") or "",
                category=category,
                source=data.get("source", "") or "",
                payment_method=payment,
                date=tx_date,
            )
        else:
            transaction = Expense(
                amount=amount,
                description=data.get("description", "") or "",
                category=category,
                payment_method=payment,
                date=tx_date,
            )

        return transaction

    def process_transaction(self, data):
        if self.validate_transaction(data):
            transaction = self.create_transaction(data)
            self.repository.save(transaction)
            return transaction
        return False

    def calculate_impact(self, transaction):
        if isinstance(transaction, Income):
            return transaction.amount
        return transaction.amount * -1

    def get_all_transactions(self):
        return self.repository.find_all()

    def get_by_category(self, category_id):
        return self.repository.find_by_category(category_id)

    def get_by_date_range(self, start, end):
        return self.repository.find_by_date_range(start, end)

    def get_by_type(self, type):
        return self.repository.find_by_type(type)

    def delete_transaction(self, transaction_id, type):
        return self.repository.delete(transaction_id, type)
