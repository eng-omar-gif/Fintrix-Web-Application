from django.db import models
from django.db.models import Sum


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    @classmethod
    def find_or_create_category(cls, name: str) -> "Category":
        category, _ = cls.objects.get_or_create(name=name.strip())
        return category


class Budget(models.Model):
    month = models.DateField()
    year = models.IntegerField()

    def __str__(self):
        return f"{self.month.strftime('%B')} {self.year}"

    def add_category_limit(self, category: "Category", limit: float) -> "CategoryBudget":
        if not self.validate(limit):
            raise ValueError("Limit must be greater than 0")
        cb = CategoryBudget.objects.create(
            budget=self,
            category=category,
            limit=limit,
            spent_amount=0.0,
        )
        return cb

    def get_total_spent(self) -> float:
        result = self.category_budgets.aggregate(total=Sum("spent_amount"))["total"]
        return result if result else 0.0

    def get_remaining(self) -> float:
        total_limit = self.category_budgets.aggregate(total=Sum("limit"))["total"] or 0.0
        return total_limit - self.get_total_spent()

    def validate(self, limit: float) -> bool:
        return limit > 0

    @staticmethod
    def check_budget_exists(month, year: int) -> bool:
        return Budget.objects.filter(
            month__month=month.month,
            year=year,
        ).exists()


class CategoryBudget(models.Model):
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name="category_budgets",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="category_budgets",
    )
    limit = models.FloatField()
    spent_amount = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.category.name} — limit: {self.limit}"

    def update_spent(self, amount: float) -> None:
        self.spent_amount += amount
        self.save(update_fields=["spent_amount"])

    def get_remaining(self) -> float:
        return self.limit - self.spent_amount

    def is_limited(self) -> bool:
        return self.spent_amount >= self.limit


class Expense(models.Model):
    category_budget = models.ForeignKey(
        CategoryBudget,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    amount = models.FloatField()
    date = models.DateField()
    description     = models.CharField(max_length=200, blank=True, default="Expense")
    def __str__(self):
        return f"{self.amount} on {self.date}"

    def get_amount(self) -> float:
        return self.amount