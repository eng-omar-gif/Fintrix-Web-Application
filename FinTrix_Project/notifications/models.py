from django.db import models
from budgets.models import CategoryBudget


class Notification(models.Model):

    NOTIFICATION_TYPES = [
        ("budget",      "Budget Warning"),
        ("transaction", "Transaction"),
        ("security",    "Security"),
        ("system",      "System"),
    ]

    category_budget = models.ForeignKey(
        CategoryBudget,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,   # security/system notifications have no budget link
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default="budget",
    )
    title   = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        status = "[READ]" if self.is_read else "[UNREAD]"
        return f"{status} {self.title}"


class NotificationController:
    THRESHOLD_PERCENTAGE: float = 80.0

    # ── checkThreshold(cb:CategoryBudget):void ───────────────────────────────
    @classmethod
    def check_threshold(cls, cb: CategoryBudget) -> None:
        """
        Monitors CategoryBudget spending.
        Fires sendAlert when spending >= thresholdPercentage.
        Avoids duplicate unread alerts for the same CategoryBudget.
        """
        if cb.limit <= 0:
            return

        percentage_used = (cb.spent_amount / cb.limit) * 100

        if percentage_used >= cls.THRESHOLD_PERCENTAGE:
            already_notified = Notification.objects.filter(
                category_budget=cb,
                notification_type="budget",
                is_archived=False,
            ).exists()

            if not already_notified:
                title   = f"Budget Exceeded: {cb.category.name}"
                message = (
                    f"You've reached {percentage_used:.0f}% of your monthly "
                    f"{cb.category.name} budget "
                    f"(${cb.spent_amount:.2f} / ${cb.limit:.2f}). "
                    f"Would you like to adjust your limits?"
                )
                cls.send_alert(cb, title, message, "budget")

    # ── sendAlert(message:String):void ──────────────────────────────────────
    @classmethod
    def send_alert(
        cls,
        cb: CategoryBudget | None,
        title: str,
        message: str,
        notification_type: str = "budget",
    ) -> "Notification":
        """Persists a Notification record."""
        return Notification.objects.create(
            category_budget=cb,
            notification_type=notification_type,
            title=title,
            message=message,
        )

    # ── markAsRead(notificationId:int):void ─────────────────────────────────
    @classmethod
    def mark_as_read(cls, notification_id: int) -> None:
        """Called when user taps a notification (SD2)."""
        Notification.objects.filter(pk=notification_id).update(is_read=True)

    # ── markAllAsRead():void ─────────────────────────────────────────────────
    @classmethod
    def mark_all_as_read(cls) -> None:
        Notification.objects.filter(is_read=False).update(is_read=True)

    # ── archiveNotification(notificationId:int):void ─────────────────────────
    @classmethod
    def archive(cls, notification_id: int) -> None:
        Notification.objects.filter(pk=notification_id).update(is_archived=True)