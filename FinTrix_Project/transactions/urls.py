from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_transactions, name='api_list_transactions'),
    path('add/', views.add_transaction, name='api_add_transaction'),
    path('categories/', views.list_categories, name='api_list_categories'),
    path('export/', views.export_transactions_csv, name='api_export_transactions_csv'),
    path('<str:tx_type>/<int:tx_id>/', views.delete_transaction, name='api_delete_transaction'),
]