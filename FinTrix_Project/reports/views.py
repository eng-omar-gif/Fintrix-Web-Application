from django.shortcuts import render
from .models import Report

def reports_page(request):

    reports = Report.objects.all()

    context = {
        'reports': reports
    }

    return render(request, 'reports.html', context)