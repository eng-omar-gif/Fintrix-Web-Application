from .models import Income, Expense

class TransactionRepository:
    def save(self, transaction):
        if isinstance(transaction, Income):
            transaction.save()
            return True
        elif isinstance(transaction, Expense):
            transaction.save()
            return True
        return False

    def find_all(self):
        incomes = list(Income.objects.all())
        expenses = list(Expense.objects.all())
        return incomes + expenses

    def find_by_category(self, category_id):
        incomes = list(Income.objects.filter(category_id=category_id))
        expenses = list(Expense.objects.filter(category_id=category_id))
        return incomes + expenses

    def find_by_date_range(self, start_date, end_date):
        incomes = Income.objects.all()
        expenses = Expense.objects.all()
        res = []
        for i in incomes:
            if start_date <= i.date <= end_date:
                res.append(i)
        for i in expenses:
            if start_date <= i.date <= end_date:
                res.append(i)
        return res

    def delete(self, transaction_id, type):
        if type == 'INCOME':
            Income.objects.get(id=transaction_id).delete()
        else:
            Expense.objects.get(id=transaction_id).delete()

    def find_by_type(self, type):
        if type == 'Income':
            return Income.objects.all()
        else:
            return Expense.objects.all()