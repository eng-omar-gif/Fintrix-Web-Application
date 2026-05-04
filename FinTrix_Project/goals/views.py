from django.shortcuts import render

def goals_page(request):
    return render(request, "goals.html")