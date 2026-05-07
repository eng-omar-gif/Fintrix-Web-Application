from .models import Income, Expense

class TransactionRepository:
    def save(self, transaction):
        transaction.save()
        return True

    def find_all(self):
        incomes = list(Income.objects.all())
        expenses = list(Expense.objects.all())
        return incomes + expenses

    def find_by_category(self, category_id):
        incomes = list(Income.objects.filter(category_id=category_id))
        expenses = list(Expense.objects.filter(category_id=category_id))
        return incomes + expenses

    def find_by_date_range(self, start_date, end_date):
        incomes = Income.objects.filter(date__gte=start_date, date__lte=end_date)
        expenses = Expense.objects.filter(date__gte=start_date, date__lte=end_date)
        return list(incomes) + list(expenses)

    def delete(self, transaction_id, type):
        if type.lower() == 'income':
            Income.objects.get(id=transaction_id).delete()
        else:
            Expense.objects.get(id=transaction_id).delete()

    def find_by_type(self, type):
        if type.lower() == 'income':
            return list(Income.objects.all())
        else:
            return list(Expense.objects.all())
