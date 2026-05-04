from django.contrib import admin

from .models import Goal


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'target_amount', 'current_savings', 'deadline')
    list_filter = ('deadline',)
    search_fields = ('name', 'user__email')
    raw_id_fields = ('user',)
