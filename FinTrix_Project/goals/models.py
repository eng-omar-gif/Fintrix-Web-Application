from django.conf import settings
from django.db import models

class Goal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField()

    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return min(int((self.current_savings / self.target_amount) * 100), 100)

    @property
    def progress(self):
        """Integer 0–100 for templates (avoids calling a method with `()` in Django templates)."""
        return self.progress_percentage()

    def __str__(self):
        return self.name