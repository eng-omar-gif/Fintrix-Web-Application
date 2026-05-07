from django.urls import path
from . import views

urlpatterns = [
    path("", views.reports_page, name="reports"),
    path("api/summary/", views.report_summary_api, name="report_summary_api"),
]