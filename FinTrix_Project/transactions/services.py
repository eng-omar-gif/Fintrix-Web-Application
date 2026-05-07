from decimal import Decimal
from .models import Income, Expense, Category

class TransactionService:

    def __init__(self, transaction_repository):
        self.repository = transaction_repository

    def validate_transaction(self, data):
        try:
            amount = float(data.get('amount', 0))
        except (ValueError, TypeError):
            return False

        if amount <= 0:
            return False

        if data.get('type', '').upper() not in ['INCOME', 'EXPENSE']:
            return False

        if not Category.objects.filter(id=data.get('category_id', data.get('category'))).exists():
            return False

        return True

    def create_transaction(self, data):
        category = Category.objects.get(id=data.get('category_id', data.get('category')))
        payment = data.get('payment_method', 'CASH').upper()  # تحويل لل uppercase

        if data['type'].upper() == 'INCOME':
            transaction = Income(
                amount=data['amount'],
                description=data.get('description', ''),
                category=category,
                source=data.get('source', ''),
                payment_method=payment
            )
        else:
            transaction = Expense(
                amount=data['amount'],
                description=data.get('description', ''),
                category=category,
                payment_method=payment
            )

        if data.get('date'):
            transaction.date = data['date']
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
        else:
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