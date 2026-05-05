from django.db import models
from django.db.models import Sum


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Budget(models.Model):
    month = models.DateField()
    year = models.IntegerField()

    def __str__(self):
        return f"{self.month.strftime('%B')} {self.year}"

    # 🔹 Add category limit
    def add_category_limit(self, category, limit):
        if not self.validate(limit):
            raise ValueError("Limit must be greater than 0")

        CategoryBudget.objects.create(
            budget=self,
            category=category,
            limit=limit
        )

    # 🔹 Total spent
    def get_total_spent(self):
        total = self.categories.aggregate(total=Sum('spent_amount'))['total']
        return total if total else 0

    # 🔹 Remaining budget
    def get_remaining(self):
        total_limit = self.categories.aggregate(total=Sum('limit'))['total'] or 0
        return total_limit - self.get_total_spent()

    # 🔹 Validate limit
    def validate(self, limit):
        return limit > 0

    # 🔹 Check if budget exists
    @staticmethod
    def check_budget_exists(month, year):
        return Budget.objects.filter(month=month, year=year).exists()


class CategoryBudget(models.Model):
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    limit = models.FloatField()
    spent_amount = models.FloatField(default=0)

    def get_remaining(self):
        return self.limit - self.spent_amount

    def is_limited(self):
        return self.spent_amount >= self.limit

    def __str__(self):
        return f"{self.category.name} - {self.limit}"