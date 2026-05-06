from django.contrib import admin
from django.urls import path, include
from transactions.views import list_transactions, add_transaction, transactions_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('authentication.urls')),
    path('api/', list_transactions, name='api_list_transactions'),
    path('api/add/', add_transaction, name='api_add_transaction'),
    path('transactions/', transactions_page, name='transactions_page'),
    path("goals/", include("goals.urls")),
    path("budgets/", include("budgets.urls")),
]
