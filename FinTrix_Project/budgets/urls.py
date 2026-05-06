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

     path("<int:budget_id>/category/<int:cb_id>/edit/",
     views.edit_category_limit, name="edit_category_limit"),

     path("<int:budget_id>/category/<int:cb_id>/delete/",
     views.delete_category, name="delete_category"),
]