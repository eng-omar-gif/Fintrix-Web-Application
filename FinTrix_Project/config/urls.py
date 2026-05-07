from django.contrib import admin
from django.urls import path, include
from transactions.views import list_transactions, add_transaction, transactions_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('authentication.urls')),
    path('api/', include('transactions.urls')),
    path('transactions/', transactions_page, name='transactions_page'),
    path("goals/", include("goals.urls")),
    path("budgets/", include("budgets.urls")),
    path("notifications/", include("notifications.urls")),
]
