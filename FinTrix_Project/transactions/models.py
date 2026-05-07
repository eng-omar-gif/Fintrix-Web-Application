from django.db import models

class CategoryType(models.TextChoices):
    INCOME = 'INCOME', 'Income'
    EXPENSE = 'EXPENSE', 'Expense'

class PaymentMethod(models.TextChoices):
    CASH = 'CASH', 'Cash'
    CREDIT_CARD = 'CREDIT_CARD', 'Credit Card'
    E_WALLET = 'E_WALLET', 'E-Wallet'

class Category(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CategoryType.choices)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        abstract = True

class Income(Transaction):
    source = models.CharField(max_length=100)

    def __str__(self):
        return f"Income: {self.amount}"

class Expense(Transaction):
    
    def __str__(self):
        return f"Expense: {self.amount}"