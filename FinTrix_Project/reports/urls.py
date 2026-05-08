from django.urls import path

from . import views

urlpatterns = [
    path("", views.reports_page, name="reports"),
    path("api/summary/", views.report_summary_api, name="report_summary_api"),
    path("export/csv/", views.report_export_csv, name="report_export_csv"),
    path("export/excel/", views.report_export_excel, name="report_export_excel"),
    path("export/pdf/", views.report_export_pdf, name="report_export_pdf"),
]
