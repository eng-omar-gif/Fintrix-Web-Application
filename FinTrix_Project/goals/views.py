from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_GET, require_http_methods

from .forms import GoalForm
from .models import Goal


def _active_goal_count(goals_iterable):
    """
    Counts the number of active goals (progress < 100%) in the provided iterable.
    Args:
    goals_iterable (iterable): An iterable of Goal objects.
    Returns:
    int: The count of active goals.
    """
    return sum(1 for g in goals_iterable if g.progress < 100)


def _goals_list(user):
    """
    Retrieves a list of Goal objects for the specified user, ordered by deadline.
    Args:user (User): The user for whom to retrieve goals.
    Returns:list: A list of Goal objects belonging to the user, ordered by deadline.
    """
    return list(Goal.objects.filter(user=user).order_by('deadline'))


@login_required
@require_http_methods(['GET', 'POST'])
def goals_page(request):
    """
    Displays the user's financial goals and handles goal creation.
    GET: Renders the goals page with the user's current goals and a form to add new goals.
    POST: Validates and saves a new goal submitted via the form, then redirects back to
    the goals page.
    Args:
    request (HttpRequest): The incoming HTTP request.
    Returns:
    HttpResponse: The rendered goals page with the user's goals and the goal creation form.
    """
    goals = _goals_list(request.user)

    if request.method == 'POST':
        form = GoalForm(request.POST)
        if form.is_valid():
            goal = form.save(commit=False)
            goal.user = request.user
            goal.save()
            messages.success(request, 'Goal created successfully.')
            return redirect('goals_page')
    else:
        form = GoalForm()

    return render(
        request,
        'goals.html',
        {
            'goals': goals,
            'form': form,
            'edit_mode': False,
            'edit_goal_id': None,
            'active_count': _active_goal_count(goals),
        },
    )


@login_required
@require_http_methods(['POST'])
def delete_goal(request, goal_id):
    """
    Handles the deletion of a specific goal identified by its ID.
    Validates that the goal belongs to the authenticated user before deletion.
    Args:
    request (HttpRequest): The incoming HTTP request.
    goal_id (int): The ID of the goal to delete.
    Returns:
    HttpResponse: Redirects to the goals page.
    """
    goal = get_object_or_404(Goal, id=goal_id, user=request.user)
    goal.delete()
    messages.success(request, 'Goal deleted.')
    return redirect('goals_page')


@login_required
@require_http_methods(['GET', 'POST'])
def edit_goal(request, goal_id):
    """
    Handles the editing of a specific goal identified by its ID.
    Args:
    request (HttpRequest): The incoming HTTP request.
    goal_id (int): The ID of the goal to edit.
    Returns:
    HttpResponse: The rendered edit page with the goal form.
    """
    goal = get_object_or_404(Goal, id=goal_id, user=request.user)

    if request.method == 'POST':
        form = GoalForm(request.POST, instance=goal)
        if form.is_valid():
            form.save()
            messages.success(request, 'Goal updated successfully.')
            return redirect('goals_page')
    else:
        form = GoalForm(instance=goal)

    goals = _goals_list(request.user)

    return render(
        request,
        'goals.html',
        {
            'goals': goals,
            'form': form,
            'edit_mode': True,
            'edit_goal_id': goal.id,
            'active_count': _active_goal_count(goals),
        },
    )
