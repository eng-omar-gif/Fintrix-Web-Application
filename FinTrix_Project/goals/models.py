from django.db import models
from django.contrib.auth.models import User

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField()

    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return min(int((self.current_savings / self.target_amount) * 100), 100)

    def __str__(self):
        return self.name