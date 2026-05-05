
# Create your views here.
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Budget, CategoryBudget
import datetime

@login_required
def budget_dashboard(request):
    """ Acts as BudgetUI.displayBudget() """
    today = datetime.date.today()
    
    # Logic for createBudget() from diagram
    budget_obj, created = Budget.objects.get_or_create(
        user=request.user,
        month__month=today.month,
        year=today.year,
        defaults={'month': today, 'year': today.year}
    )
    
    categories = budget_obj.categories.all()
    total_limit = sum(c.limit for c in categories)
    total_spent = budget_obj.get_total_spent()
    
    context = {
        'budget': budget_obj,
        'categories': categories,
        'total_limit': total_limit,
        'global_utilization': round((total_spent / total_limit * 100) if total_limit > 0 else 0),
        'days_remaining': 30 - today.day
    }
    return render(request, 'budgets.html', context)

@login_required
def add_category_limit(request):
    """ Implementation of BudgetController.addCategoryLimit() """
    if request.method == "POST":
        limit_val = float(request.POST.get('limit', 0))
        
        # Implementation of validate(limit) from diagram
        if limit_val <= 0:
            return redirect('budget_dashboard') # Simple validation

        current_budget = Budget.objects.filter(user=request.user).latest('id')
        
        CategoryBudget.objects.create(
            budget=current_budget,
            name=request.POST.get('category_name'),
            category_type="VARIABLE",
            limit=limit_val,
            spent_amount=0.0
        )
    return redirect('budget_dashboard')