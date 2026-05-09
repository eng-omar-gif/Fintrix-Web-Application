/**
 * @fileoverview Sign-up page controller for FinTrix.
 * Handles password visibility toggle, real-time field validation,
 * password strength indicator, and async registration against
 * the `/api/auth/register/` endpoint.
 * @module script-signup
 */

/**
 * Toggles a password input between `type="password"` and `type="text"`.
 *
 * @param {string} fieldId - The `id` of the password `<input>` element to toggle.
 * @returns {void}
 */
function togglePassword(fieldId) {
    const input  = document.getElementById(fieldId);
    const btn    = input.parentElement.querySelector('.password-toggle');
    const eyeOn  = btn.querySelector('.eye-icon');
    const eyeOff = btn.querySelector('.eye-off-icon');

    const isHidden = input.type === 'password';
    input.type     = isHidden ? 'text' : 'password';
    eyeOn.style.display  = isHidden ? 'none' : '';
    eyeOff.style.display = isHidden ? ''     : 'none';
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

/**
 * Evaluates the strength of a password and updates the strength indicator UI.
 * Scoring criteria: length ≥ 8, uppercase letter, lowercase letter, digit,
 * special character (1 point each, max 5).
 *
 * @param {string} password - The password string to evaluate.
 * @returns {number|undefined} Strength score (0–5), or `undefined` if password is empty.
 */
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthFill      = document.getElementById('strengthFill');
    const strengthText      = document.getElementById('strengthText');

    if (password.length === 0) {
        strengthIndicator.classList.remove('show');
        return;
    }

    strengthIndicator.classList.add('show');

    const checks = {
        length:    password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number:    /[0-9]/.test(password),
        special:   /[^A-Za-z0-9]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;

    strengthFill.className = 'strength-fill';

    if (strength <= 2) {
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak password';
        strengthText.style.color = '#ef4444';
    } else if (strength <= 3) {
        strengthFill.classList.add('medium');
        strengthText.textContent = 'Medium password';
        strengthText.style.color = '#f59e0b';
    } else {
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong password';
        strengthText.style.color = '#10b981';
    }

    return strength;
}

/**
 * Real-time validation for the `#fullName` field.
 * Requires at least 2 characters; shows/hides `#nameValidation` message.
 * @listens HTMLInputElement#input
 */
document.getElementById('fullName').addEventListener('input', function (e) {
    const value      = e.target.value;
    const validation = document.getElementById('nameValidation');
    if (value.length < 2) {
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
        validation.textContent = 'Name must be at least 2 characters';
        validation.className   = 'validation-message error show';
    } else {
        e.target.classList.remove('invalid');
        e.target.classList.add('valid');
        validation.classList.remove('show');
    }
});

/**
 * Real-time validation for the `#email` field.
 * Validates against a standard email regex; shows/hides `#emailValidation`.
 * @listens HTMLInputElement#input
 */
document.getElementById('email').addEventListener('input', function (e) {
    const value      = e.target.value;
    const validation = document.getElementById('emailValidation');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length > 0 && !emailRegex.test(value)) {
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
        validation.textContent = 'Please enter a valid email address';
        validation.className   = 'validation-message error show';
    } else if (value.length > 0) {
        e.target.classList.remove('invalid');
        e.target.classList.add('valid');
        validation.classList.remove('show');
    }
});

/**
 * Updates the password strength indicator as the user types in `#password`.
 * Also re-triggers confirm-password validation if that field already has a value.
 * @listens HTMLInputElement#input
 */
document.getElementById('password').addEventListener('input', function (e) {
    checkPasswordStrength(e.target.value);
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword.value) {
        confirmPassword.dispatchEvent(new Event('input'));
    }
});

/**
 * Real-time validation for the `#confirmPassword` field.
 * Checks that its value matches `#password`; shows/hides `#confirmValidation`.
 * @listens HTMLInputElement#input
 */
document.getElementById('confirmPassword').addEventListener('input', function (e) {
    const password   = document.getElementById('password').value;
    const validation = document.getElementById('confirmValidation');
    if (e.target.value.length > 0 && e.target.value !== password) {
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
        validation.textContent = 'Passwords do not match';
        validation.className   = 'validation-message error show';
    } else if (e.target.value.length > 0) {
        e.target.classList.remove('invalid');
        e.target.classList.add('valid');
        validation.textContent = 'Passwords match';
        validation.className   = 'validation-message success show';
    }
});

/**
 * Handles `#signupForm` submission asynchronously.
 *
 * Validates all fields (name length, email format, password length,
 * password confirmation), then POSTs to `/api/auth/register/` as JSON
 * (with CSRF token header). On success, shows a success banner and redirects.
 * On failure, restores the button and shows an error banner.
 *
 * @async
 * @listens HTMLFormElement#submit
 * @returns {Promise<void>}
 */
document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn      = document.getElementById('submitBtn');
    const btnText        = document.getElementById('btnText');
    const btnIcon        = document.getElementById('btnIcon');
    const errorMessage   = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    const formData = {
        fullName:        document.getElementById('fullName').value,
        email:           document.getElementById('email').value,
        password:        document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    if (formData.fullName.length < 2) { showError('Please enter your full name'); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))          { showError('Please enter a valid email address'); return; }
    if (formData.password.length < 8)              { showError('Password must be at least 8 characters long'); return; }
    if (formData.password !== formData.confirmPassword) { showError('Passwords do not match'); return; }

    submitBtn.classList.add('loading');
    btnText.textContent = 'Creating Account';
    btnIcon.innerHTML   = '<div class="spinner"></div>';
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');

    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
            },
            credentials: 'same-origin',
            body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Registration failed');

        successMessage.textContent = data.message || 'Account created successfully! Redirecting...';
        successMessage.classList.add('show');
        setTimeout(() => { window.location.href = data.redirect || '/'; }, 800);

    } catch (error) {
        submitBtn.classList.remove('loading');
        btnText.textContent = 'Register Account';
        btnIcon.textContent = '→';
        showError(error.message || 'Registration failed. Please try again.');
    }
});

/**
 * Displays a dismissible error banner (`#errorMessage`) with the given text,
 * scrolls the page to the top so it is visible, and auto-hides after 5 seconds.
 *
 * @param {string} message - The error message to display.
 * @returns {void}
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { errorMessage.classList.remove('show'); }, 5000);
}

/**
 * Reads a cookie value by name from `document.cookie`.
 *
 * @param {string} name - The cookie name to look up.
 * @returns {string|null} The decoded value, or `null` if the cookie is absent.
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Clears both the error and success banners whenever the user types
 * in any `<input>` on the sign-up form.
 * @listens HTMLInputElement#input
 */
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function () {
        document.getElementById('errorMessage').classList.remove('show');
        document.getElementById('successMessage').classList.remove('show');
    });
});
