from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_transactions, name='api_list_transactions'),
    path('add/', views.add_transaction, name='api_add_transaction'),
]