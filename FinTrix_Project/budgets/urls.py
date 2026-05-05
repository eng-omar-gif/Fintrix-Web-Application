from django.urls import path
from . import views

urlpatterns = [
    path('', views.budget_dashboard, name='budget_dashboard'),
    path('add/<int:budget_id>/', views.add_category_limit, name='add_category_limit'),
    path('create/', views.create_budget, name='create_budget'),
]