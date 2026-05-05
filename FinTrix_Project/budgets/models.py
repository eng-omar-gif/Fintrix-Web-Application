
# Create your models here.
from django.db import models
from django.contrib.auth.models import User
import datetime

class Budget(models.Model):
    # Based on Class Diagram: month, budgetId, year
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.DateField()
    year = models.IntegerField()

    def get_total_spent(self):
        # Implementation of getTotalSpent()
        return sum(cat.spent_amount for cat in self.categories.all())

    def get_remaining(self):
        # Implementation of getRemaining()
        total_limit = sum(cat.limit for cat in self.categories.all())
        return total_limit - self.get_total_spent()

    def __str__(self):
        return f"Budget for {self.month.strftime('%B')} {self.year}"

class CategoryBudget(models.Model):
    # Based on Class Diagram: limit, spentAmount
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=50) # FIXED, VARIABLE, etc.
    limit = models.FloatField()
    spent_amount = models.FloatField(default=0.0)

    @property
    def percentage(self):
        if self.limit > 0:
            return (self.spent_amount / self.limit) * 100
        return 0
    @property
    def remaining(self):
        # Implementation of calculateRemaining() from Diagram
        return self.limit - self.spent_amount

    @property
    def percentage(self):
        if self.limit > 0:
            return (self.spent_amount / self.limit) * 100
        return 0