from django.urls import path
from . import views

urlpatterns = [
    path('', views.budget_dashboard, name='budget_dashboard'),
    path('add-limit/', views.add_category_limit, name='add_category_limit'),
]