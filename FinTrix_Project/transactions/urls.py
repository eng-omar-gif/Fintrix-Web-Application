from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_transactions, name='list_transactions'),
    path('add/', views.add_transaction, name='add_transaction'),
]