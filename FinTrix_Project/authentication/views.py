import json

from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods

from .services import AuthenticationService, RegistrationInput


def _parse_json_body(request):
    """
    Parses and decodes the JSON body from an HTTP request.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        dict | None: Parsed JSON data as a dictionary, empty dict if body is empty,
        or None if the JSON is invalid.
    """
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


@ensure_csrf_cookie
@require_GET
def home(request):
    """
    Renders the home page.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        HttpResponse: Rendered home page.
    """

    return render(request, 'home.html')


@ensure_csrf_cookie
@require_GET
def login_page(request):
    """
    Renders the login page.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        HttpResponse: Rendered login page.
    """
    return render(request, 'login.html')


@ensure_csrf_cookie
@require_GET
def signup_page(request):
    """
    Renders the signup page.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        HttpResponse: Rendered signup page.
    """
    return render(request, 'signup.html')


@require_http_methods(['POST'])
def register_api(request):
    """
    Registers a new user account and logs the user in.

    Args:
        request (HttpRequest): HTTP request containing registration data.

    Returns:
        JsonResponse: Success or error response with redirect information.
    """
    payload = _parse_json_body(request)
    if payload is None:
        return JsonResponse({'success': False, 'message': 'Invalid JSON body.'}, status=400)

    name = payload.get('full_name') or payload.get('fullName') or ''
    email = payload.get('email') or ''
    password = payload.get('password') or ''

    service = AuthenticationService()
    data = RegistrationInput(name=name, email=email, password=password)
    try:
        user = service.register_user(data)
    except ValueError as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

    login(request, user)
    return JsonResponse({
        'success': True,
        'message': 'Account created successfully.',
        'redirect': '/dashboard/',
    })


@require_http_methods(['POST'])
def login_api(request):
    """
    Authenticates a user and starts a login session.

    Args:
        request (HttpRequest): HTTP request containing login data.

    Returns:
        JsonResponse: Success or error response with redirect information.
    """
    payload = _parse_json_body(request)
    if payload is None:
        return JsonResponse({'success': False, 'message': 'Invalid JSON body.'}, status=400)

    email = payload.get('email') or ''
    password = payload.get('password') or ''

    service = AuthenticationService()
    err = service.validate_login(email, password)
    if err:
        return JsonResponse({'success': False, 'message': err}, status=400)

    user = service.login_user(email, password)
    if user is None:
        return JsonResponse(
            {'success': False, 'message': 'Invalid email or password.'},
            status=401,
        )

    login(request, user)
    return JsonResponse({
        'success': True,
        'message': 'Signed in successfully.',
        'redirect': '/dashboard/',
    })


@require_GET
@login_required
def logout_view(request):
    """
    Logs out the currently authenticated user.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        HttpResponseRedirect: Redirects user to the home page.
    """
    logout(request)
    return redirect('home')
