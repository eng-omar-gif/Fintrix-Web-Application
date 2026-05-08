import csv
import io
from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.http import FileResponse, HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

from .services import build_report_payload


def _parse_dates(request):
    start = request.GET.get("start_date")
    end = request.GET.get("end_date")
    if not start or not end:
        return None, None, JsonResponse({"error": "start_date and end_date are required"}, status=400)
    try:
        start_d = datetime.strptime(start, "%Y-%m-%d").date()
        end_d = datetime.strptime(end, "%Y-%m-%d").date()
    except ValueError:
        return None, None, JsonResponse({"error": "Invalid date format; use YYYY-MM-DD"}, status=400)
    if end_d < start_d:
        return None, None, JsonResponse({"error": "end_date must be on or after start_date"}, status=400)
    return start_d, end_d, None


def _category_id(request):
    raw = request.GET.get("category_id")
    if not raw:
        return None
    try:
        return int(raw)
    except ValueError:
        return None


@login_required
def reports_page(request):
    return render(request, "reports.html")


@login_required
@require_GET
def report_summary_api(request):
    start_d, end_d, err = _parse_dates(request)
    if err:
        return err
    cat = _category_id(request)
    data = build_report_payload(start_d, end_d, cat)
    return JsonResponse(
        {
            "total_income": data["total_income"],
            "total_expense": data["total_expense"],
            "net": data["net"],
            "weekly_chart": data["weekly_chart"],
            "expense_allocation": data["expense_allocation"],
            "largest_transactions": data["largest_transactions"],
        }
    )


@login_required
@require_GET
def report_export_csv(request):
    start_d, end_d, err = _parse_dates(request)
    if err:
        return err
    cat = _category_id(request)
    data = build_report_payload(start_d, end_d, cat)

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["FinTrix Report", data["period_start"], "to", data["period_end"]])
    w.writerow([])
    w.writerow(["Total income", f"{data['total_income']:.2f}"])
    w.writerow(["Total expense", f"{data['total_expense']:.2f}"])
    w.writerow(["Net", f"{data['net']:.2f}"])
    w.writerow([])
    w.writerow(["Week", "Income", "Expense"])
    for row in data["weekly_chart"]:
        w.writerow([row["label"], row["income"], row["expense"]])
    w.writerow([])
    w.writerow(["Expense category", "Amount"])
    for row in data["expense_allocation"]:
        w.writerow([row["category"], row["amount"]])
    w.writerow([])
    w.writerow(["Entity", "Category", "Date", "Amount", "Status"])
    for row in data["largest_transactions"]:
        w.writerow([row["entity"], row["category"], row["date"], row["amount"], row["status"]])

    resp = HttpResponse(buf.getvalue(), content_type="text/csv; charset=utf-8")
    resp["Content-Disposition"] = f'attachment; filename="fintrix_report_{start_d}_{end_d}.csv"'
    return resp


@login_required
@require_GET
def report_export_excel(request):
    from openpyxl import Workbook
    from openpyxl.styles import Font

    start_d, end_d, err = _parse_dates(request)
    if err:
        return err
    cat = _category_id(request)
    data = build_report_payload(start_d, end_d, cat)

    wb = Workbook()
    ws = wb.active
    ws.title = "Summary"
    ws.append(["FinTrix Report", data["period_start"], "to", data["period_end"]])
    ws.append([])
    ws.append(["Total income", data["total_income"]])
    ws.append(["Total expense", data["total_expense"]])
    ws.append(["Net", data["net"]])
    ws.append([])
    ws.append(["Week", "Income", "Expense"])
    for row in data["weekly_chart"]:
        ws.append([row["label"], row["income"], row["expense"]])
    ws.append([])
    ws.append(["Expense category", "Amount"])
    for row in data["expense_allocation"]:
        ws.append([row["category"], row["amount"]])
    ws.append([])
    ws.append(["Entity", "Category", "Date", "Amount", "Status"])
    for row in data["largest_transactions"]:
        ws.append([row["entity"], row["category"], row["date"], row["amount"], row["status"]])
    ws["A1"].font = Font(bold=True)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return FileResponse(
        out,
        as_attachment=True,
        filename=f"fintrix_report_{start_d}_{end_d}.xlsx",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@login_required
@require_GET
def report_export_pdf(request):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    start_d, end_d, err = _parse_dates(request)
    if err:
        return err
    cat = _category_id(request)
    data = build_report_payload(start_d, end_d, cat)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, title="FinTrix Report")
    styles = getSampleStyleSheet()
    story = [
        Paragraph(f"<b>FinTrix Report</b> — {data['period_start']} to {data['period_end']}", styles["Title"]),
        Spacer(1, 12),
        Paragraph(
            f"Income: <b>${data['total_income']:,.2f}</b> &nbsp; Expense: <b>${data['total_expense']:,.2f}</b> &nbsp; Net: <b>${data['net']:,.2f}</b>",
            styles["Normal"],
        ),
        Spacer(1, 18),
    ]

    wdata = [["Week", "Income", "Expense"]]
    for row in data["weekly_chart"]:
        wdata.append([row["label"], f"${row['income']:,.2f}", f"${row['expense']:,.2f}"])
    t1 = Table(wdata, repeatRows=1)
    t1.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
            ]
        )
    )
    story.append(t1)
    story.append(Spacer(1, 16))

    ldata = [["Entity", "Category", "Date", "Amount"]]
    for row in data["largest_transactions"]:
        ldata.append([row["entity"][:40], row["category"], row["date"], f"${row['amount']:,.2f}"])
    t2 = Table(ldata, repeatRows=1)
    t2.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ]
        )
    )
    story.append(Paragraph("<b>Largest transactions</b>", styles["Heading2"]))
    story.append(Spacer(1, 6))
    story.append(t2)

    doc.build(story)
    buf.seek(0)
    return FileResponse(
        buf,
        as_attachment=True,
        filename=f"fintrix_report_{start_d}_{end_d}.pdf",
        content_type="application/pdf",
    )
