from decimal import Decimal
from .models import Income, Expense, Category

class TransactionService:


    def __init__(self, transaction_repository):
        self.repository = transaction_repository

    def validate_transaction(self, data):
        if (isinstance(data.get('amount'), (int, float, Decimal)) and 
            data.get('amount', 0) > 0 and
            data.get('type') in ['INCOME', 'EXPENSE'] and 
            isinstance(data.get('description', ''), str) and 
            len(data.get('description', '')) < 255 and 
            Category.objects.filter(id=data.get('category_id')).exists()):
            return True
        return False

    def create_transaction(self, data):
        if data['type'] == 'INCOME':
            transaction = Income(
                amount=data['amount'],
                description=data['description'],
                category_id=data['category_id'],
                source=data.get('source', '')
            )
        else:
            transaction = Expense(
                amount=data['amount'],
                description=data['description'],
                category_id=data['category_id']
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