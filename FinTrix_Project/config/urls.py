from django.contrib import admin
from django.urls import path, include
from transactions.views import list_transactions, add_transaction

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('authentication.urls')),
    path('api/', list_transactions, name='list_transactions'),
    path('api/add/', add_transaction, name='add_transaction'),
    path("goals/", include("goals.urls")),
    path("budgets/", include("budgets.urls")),
]
