from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path("", views.budget_dashboard, name="budget_dashboard"),

    # Budget CRUD — maps to SD1
    path("create/",views.create_budget,name="create_budget"),
    path("list/",views.budget_list,name="budget_list"),
    path("<int:budget_id>/",views.budget_detail,name="budget_detail"),

    # Category limit — BudgetController.setLimit()
    path("<int:budget_id>/add-category/",
         views.add_category_limit, name="add_category_limit"),

    # Expense — BudgetController.addExpense() + updateBudget()
    path("<int:budget_id>/add-expense/",
         views.add_expense, name="add_expense"),

    # Notifications — SD2
    path("notifications/",
         views.notification_center, name="notification_center"),
    path("notifications/<int:notification_id>/read/",
         views.mark_as_read, name="mark_as_read"),
    path("notifications/<int:notification_id>/navigate/",
         views.navigate_to_budget_from_notification,
         name="navigate_to_budget_from_notification"),
]