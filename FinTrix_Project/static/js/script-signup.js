
// Password visibility toggle
function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleIcon = passwordInput.parentElement.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        
    } else {
        passwordInput.type = 'password';
        
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (password.length === 0) {
        strengthIndicator.classList.remove('show');
        return;
    }
    
    strengthIndicator.classList.add('show');
    
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
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

// Real-time validation
document.getElementById('fullName').addEventListener('input', function(e) {
    const value = e.target.value;
    const validation = document.getElementById('nameValidation');
    
    if (value.length < 2) {
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
        validation.textContent = 'Name must be at least 2 characters';
        validation.className = 'validation-message error show';
    } else {
        e.target.classList.remove('invalid');
        e.target.classList.add('valid');
        validation.classList.remove('show');
    }
});

document.getElementById('email').addEventListener('input', function(e) {
    const value = e.target.value;
    const validation = document.getElementById('emailValidation');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value.length > 0 && !emailRegex.test(value)) {
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
        validation.textContent = 'Please enter a valid email address';
        validation.className = 'validation-message error show';
    } else if (value.length > 0) {
        e.target.classList.remove('invalid');
        e.target.classList.add('valid');
        validation.classList.remove('show');
    }
});

document.getElementById('password').addEventListener('input', function(e) {
    checkPasswordStrength(e.target.value);
    
    // Also check confirm password if it has value
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword.value) {
        confirmPassword.dispatchEvent(new Event('input'));
    }
});

document.getElementById('confirmPassword').addEventListener('input', function(e) {
    const password = document.getElementById('password').value;
    const validation = document.getElementById('confirmValidation');
    
    if (e.target.value.length > 0 && e.target.value !== password) {
        e.target.classList.add('invalid');
        e.target.classList.remove('valid');
        validation.textContent = 'Passwords do not match';
        validation.className = 'validation-message error show';
    } else if (e.target.value.length > 0) {
        e.target.classList.remove('invalid');
        e.target.classList.add('valid');
        validation.textContent = 'Passwords match';
        validation.className = 'validation-message success show';
    }
});

// Form submission
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Validate all fields
    let isValid = true;
    
    if (formData.fullName.length < 2) {
        showError('Please enter your full name');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (formData.password.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }
    
    if (formData.password !== formData.confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    btnText.textContent = 'Creating Account';
    btnIcon.innerHTML = '<div class="spinner"></div>';
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
            body: JSON.stringify({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
            }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        successMessage.textContent =
            data.message || 'Account created successfully! Redirecting...';
        successMessage.classList.add('show');

        setTimeout(() => {
            window.location.href = data.redirect || '/';
        }, 800);
    } catch (error) {
        submitBtn.classList.remove('loading');
        btnText.textContent = 'Register Account';
        btnIcon.textContent = '→';

        showError(error.message || 'Registration failed. Please try again.');
    }
});

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Helper function to get CSRF token for Django
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

// Clear messages on input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        document.getElementById('errorMessage').classList.remove('show');
        document.getElementById('successMessage').classList.remove('show');
    });
});