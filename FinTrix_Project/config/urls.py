from django.contrib import admin
from django.urls import include, path

from transactions.views import add_transaction, list_transactions

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('authentication.urls')),
    path('api/', list_transactions, name='list_transactions'),
    path('api/add/', add_transaction, name='add_transaction'),
]