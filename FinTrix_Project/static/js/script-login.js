// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');
    if (!passwordInput || !toggleIcon) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '👁️‍🗨️';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁';
    }
}

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

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function resetSubmitButton(submitBtn, btnText, btnIcon) {
    submitBtn.classList.remove('loading');
    btnText.textContent = 'Login';
    btnIcon.textContent = '→';
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const errorMessage = document.getElementById('errorMessage');
    const rememberEl = document.getElementById('remember');

    const formData = {
        email: document.getElementById('email').value,
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
    btnText.textContent = 'Signing in';
    btnIcon.innerHTML = '<div class="spinner"></div>';
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
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
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

document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', function () {
        document.getElementById('errorMessage').classList.remove('show');
    });
});

document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }
    });
});
