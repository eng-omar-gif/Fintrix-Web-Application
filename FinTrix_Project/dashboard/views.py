from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .services import dashboard_json_payload, financial_snapshot


@login_required
def dashboard(request):
    snap = financial_snapshot(request.user)
    chart_data = dashboard_json_payload(snap)
    return render(
        request,
        "dashboard.html",
        {
            "snap": snap,
            "chart_data": chart_data,
            "page_title": "Dashboard Overview",
        },
    )