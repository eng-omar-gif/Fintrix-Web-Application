import re
from dataclasses import dataclass
from typing import Optional

from django.contrib.auth import authenticate

from .models import User


@dataclass
class RegistrationInput:
    name: str
    email: str
    password: str


class AuthenticationService:
    

    _email_re = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

    def validate_registration(self, data: RegistrationInput) -> Optional[str]:
        name = (data.name or '').strip()
        email = (data.email or '').strip().lower()
        password = data.password or ''

        if len(name) < 2:
            return 'Name must be at least 2 characters.'
        if not self._email_re.match(email):
            return 'Please enter a valid email address.'
        if len(password) < 8:
            return 'Password must be at least 8 characters long.'
        if User.objects.filter(email__iexact=email).exists():
            return 'An account with this email already exists.'
        return None

    def validate_login(self, email: str, password: str) -> Optional[str]:
        email = (email or '').strip()
        if not email or not password:
            return 'Please provide email and password.'
        if not self._email_re.match(email):
            return 'Please enter a valid email address.'
        return None

    def register_user(self, data: RegistrationInput) -> User:
        err = self.validate_registration(data)
        if err:
            raise ValueError(err)
        email = data.email.strip().lower()
        return User.objects.create_user(
            email=email,
            password=data.password,
            name=data.name.strip(),
        )

    def login_user(self, email: str, password: str) -> Optional[User]:
        err = self.validate_login(email, password)
        if err:
            return None
        email_clean = email.strip().lower()
        return authenticate(username=email_clean, password=password)
