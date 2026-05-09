/**
 * @fileoverview Login page controller for FinTrix.
 * Handles password visibility toggle, CSRF token retrieval,
 * inline error display, and async form submission against
 * the `/api/auth/login/` endpoint.
 * @module script-login
 */

/**
 * Toggles the `#password` input between `type="password"` and `type="text"`,
 * and updates the adjacent toggle icon accordingly.
 * @returns {void}
 */
function togglePassword() {
    const input    = document.getElementById('password');
    const eyeOn    = document.querySelector('.password-toggle .eye-icon');
    const eyeOff   = document.querySelector('.password-toggle .eye-off-icon');
    const btn      = document.querySelector('.password-toggle');

    const isHidden = input.type === 'password';
    input.type     = isHidden ? 'text' : 'password';
    eyeOn.style.display  = isHidden ? 'none'  : '';
    eyeOff.style.display = isHidden ? ''      : 'none';
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

/**
 * Reads a cookie value by name from `document.cookie`.
 *
 * @param {string} name - The cookie name to look up.
 * @returns {string|null} The decoded cookie value, or `null` if not found.
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
 * Displays an error banner (`#errorMessage`) with the given text,
 * then auto-hides it after 5 seconds.
 *
 * @param {string} message - The error message to display.
 * @returns {void}
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

/**
 * Resets the submit button to its default (non-loading) state.
 *
 * @param {HTMLButtonElement} submitBtn - The form submit button.
 * @param {HTMLElement}       btnText   - The element containing the button label.
 * @param {HTMLElement}       btnIcon   - The element containing the button icon.
 * @returns {void}
 */
function resetSubmitButton(submitBtn, btnText, btnIcon) {
    submitBtn.classList.remove('loading');
    btnText.textContent = 'Login';
    btnIcon.textContent = '→';
}

/**
 * Handles `#loginForm` submission asynchronously.
 *
 * Validates that email and password are present and that the email is
 * well-formed, then POSTs credentials to `/api/auth/login/` as JSON
 * (with CSRF token header). On success, redirects to `data.redirect`.
 * On failure, shows an error banner and restores the submit button.
 *
 * @async
 * @listens HTMLFormElement#submit
 * @returns {Promise<void>}
 */
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn   = document.getElementById('submitBtn');
    const btnText     = document.getElementById('btnText');
    const btnIcon     = document.getElementById('btnIcon');
    const errorMessage = document.getElementById('errorMessage');
    const rememberEl  = document.getElementById('remember');

    const formData = {
        email:    document.getElementById('email').value,
        password: document.getElementById('password').value,
        remember: rememberEl ? rememberEl.checked : false,
    };

    if (!formData.email || !formData.password) {
        showError('Please fill in all fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('Please enter a valid email address');
        return;
    }

    submitBtn.classList.add('loading');
    btnText.textContent  = 'Signing in';
    btnIcon.innerHTML    = '<div class="spinner"></div>';
    errorMessage.classList.remove('show');

    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
            },
            credentials: 'same-origin',
            body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            resetSubmitButton(submitBtn, btnText, btnIcon);
            showError(data.message || 'Invalid email or password. Please try again.');
            return;
        }

        window.location.href = data.redirect || '/';
    } catch (err) {
        resetSubmitButton(submitBtn, btnText, btnIcon);
        showError('Something went wrong. Please try again.');
    }
});

/**
 * Clears the `#errorMessage` banner whenever the user types in any input field.
 * @listens HTMLInputElement#input
 */
document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', function () {
        document.getElementById('errorMessage').classList.remove('show');
    });
});

/**
 * Submits the login form when the Enter key is pressed inside any input.
 * @listens HTMLInputElement#keypress
 */
document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }
    });
});
