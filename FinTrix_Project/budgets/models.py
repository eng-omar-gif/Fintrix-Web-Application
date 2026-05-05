from django.db import models
from django.db.models import Sum



class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    @classmethod
    def find_or_create_category(cls, name: str) -> "Category":
        """Maps to findOrCreateCategory(name:String):Category in the class diagram."""
        category, _ = cls.objects.get_or_create(name=name.strip())
        return category



class Budget(models.Model):
    # month stored as a DateField (first day of the month, e.g. 2024-03-01)
    # year kept as a separate IntegerField to match the diagram attribute
    month = models.DateField()
    year = models.IntegerField()

    def __str__(self):
        return f"{self.month.strftime('%B')} {self.year}"

    # ── addCategoryLimit(category:Category, limit:double):void ──────────────
    def add_category_limit(self, category: "Category", limit: float) -> "CategoryBudget":
        """
        Validates the limit and creates a CategoryBudget entry.
        Matches addCategoryLimit in the class diagram and
        budget.addCategoryLimit(category, limit) call in SD1.
        """
        if not self.validate(limit):
            raise ValueError("Limit must be greater than 0")

        cb = CategoryBudget.objects.create(
            budget=self,
            category=category,
            limit=limit,
            spent_amount=0.0,
        )
        return cb

    # ── getTotalSpent():double ───────────────────────────────────────────────
    def get_total_spent(self) -> float:
        result = self.category_budgets.aggregate(total=Sum("spent_amount"))["total"]
        return result if result else 0.0

    # ── getRemaining():double ────────────────────────────────────────────────
    def get_remaining(self) -> float:
        """
        Called as budget.getRemaining() in SD1 after addCategoryLimit.
        Returns total_limit - total_spent across all CategoryBudgets.
        """
        total_limit = (
            self.category_budgets.aggregate(total=Sum("limit"))["total"] or 0.0
        )
        return total_limit - self.get_total_spent()

    # ── validate(limit:double):boolean ──────────────────────────────────────
    def validate(self, limit: float) -> bool:
        """Called as validate(limit>0) in SD1 before creating the Budget."""
        return limit > 0

    # ── checkBudgetExists(month:Date, year:int):boolean ──────────────────────
    @staticmethod
    def check_budget_exists(month, year: int) -> bool:
        """
        Called as checkBudgetExists(month, year) in SD1.
        Checks by month number + year to avoid cross-year false positives.
        """
        return Budget.objects.filter(
            month__month=month.month,
            year=year,
        ).exists()



class CategoryBudget(models.Model):
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name="category_budgets",   # budget.category_budgets.all()
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

    # ── updateSpent(amount:double):void ─────────────────────────────────────
    def update_spent(self, amount: float) -> None:
        """
        Called by BudgetController.updateBudget(expense) in the class diagram.
        Increments spentAmount and persists, then checks notification threshold.
        """
        self.spent_amount += amount
        self.save(update_fields=["spent_amount"])

        # After updating, ask NotificationController to check threshold (SD2)
        NotificationController.check_threshold(self)

    # ── getRemaining():double ────────────────────────────────────────────────
    def get_remaining(self) -> float:
        return self.limit - self.spent_amount

    # ── isLimited():boolean ──────────────────────────────────────────────────
    def is_limited(self) -> bool:
        """Returns True when spentAmount has reached or exceeded the limit."""
        return self.spent_amount >= self.limit



class Expense(models.Model):
    category_budget = models.ForeignKey(
        CategoryBudget,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    amount = models.FloatField()
    date = models.DateField()

    def __str__(self):
        return f"{self.amount} on {self.date}"

    # ── getAmount():double ───────────────────────────────────────────────────
    def get_amount(self) -> float:
        return self.amount



class Notification(models.Model):
    category_budget = models.ForeignKey(
        CategoryBudget,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{'[READ]' if self.is_read else '[UNREAD]'} {self.message}"



class NotificationController:
    THRESHOLD_PERCENTAGE: float = 80.0  # configurable threshold

    # ── checkThreshold(cb:CategoryBudget):void ───────────────────────────────
    @classmethod
    def check_threshold(cls, cb: CategoryBudget) -> None:
        """
        Called after every updateSpent() (SD2: NotificationController → checkThreshold).
        Creates a Notification if spending crosses the threshold.
        Avoids duplicate alerts for the same budget crossing.
        """
        if cb.limit <= 0:
            return

        percentage_used = (cb.spent_amount / cb.limit) * 100

        if percentage_used >= cls.THRESHOLD_PERCENTAGE:
            # Avoid duplicate notifications for same threshold crossing
            already_notified = Notification.objects.filter(
                category_budget=cb,
                is_read=False,
            ).exists()

            if not already_notified:
                message = (
                    f"Warning: '{cb.category.name}' budget has reached "
                    f"{percentage_used:.1f}% of its limit "
                    f"({cb.spent_amount:.2f} / {cb.limit:.2f})."
                )
                cls.send_alert(cb, message)

    # ── sendAlert(message:String):void ──────────────────────────────────────
    @classmethod
    def send_alert(cls, cb: CategoryBudget, message: str) -> Notification:
        """Persists an alert Notification linked to the CategoryBudget."""
        return Notification.objects.create(
            category_budget=cb,
            message=message,
        )

    # ── markAsRead(notificationId:int):void ─────────────────────────────────
    @classmethod
    def mark_as_read(cls, notification_id: int) -> None:
        """
        Called as markAsRead(notificationId) in SD2 when user taps a notification.
        """
        Notification.objects.filter(pk=notification_id).update(is_read=True)