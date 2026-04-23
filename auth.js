import { apiRequest, showAlert, toggleLoading, toggleTheme, isAuthenticated, logoutUser, initTheme } from './utils.js';
import { ENDPOINTS, STORAGE_KEYS, SUCCESS_MESSAGES, THEME_CONFIG, PASSWORD_STRENGTH, ERROR_MESSAGES } from './constants.js';

// Helper to toggle password visibility
const setupPasswordToggle = (inputId, toggleId) => {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (input && toggle) {
        toggle.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            const icon = toggle.querySelector('i');
            if (icon) icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }
};

// Helper to setup password strength meter
const setupPasswordStrength = (inputId, barId, textId) => {
    const input = document.getElementById(inputId);
    const bar = document.querySelector(`#${barId} div`);
    const text = document.getElementById(textId);

    if (!input || !bar) return;

    input.addEventListener('input', () => {
        const val = input.value;
        if (!val) {
            bar.style.width = '0%';
            if (text) text.innerText = '';
            return;
        }

        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const level = score > 0 ? PASSWORD_STRENGTH.LEVELS[score - 1] : { label: 'Too Short', color: 'bg-red-500', text: 'text-red-500', width: '10%' };

        bar.className = `h-full transition-all duration-300 ${level.color}`;
        bar.style.width = level.width;
        if (text) {
            text.innerText = level.label;
            text.className = `text-[10px] mt-1 font-medium transition-colors ${level.text}`;
        }
    });
};

// Helper to setup real-time password matching validation
const setupPasswordMatchValidation = (passwordInputId, confirmPasswordInputId, errorElementId, submitBtnSelector) => {
    const passwordInput = document.getElementById(passwordInputId);
    const confirmPasswordInput = document.getElementById(confirmPasswordInputId);
    const errorElement = document.getElementById(errorElementId);
    const submitBtn = document.querySelector(submitBtnSelector);

    if (!passwordInput || !confirmPasswordInput || !errorElement) return;

    const validateMatch = () => {
        const isMatch = passwordInput.value === confirmPasswordInput.value;
        const isConfirmNotEmpty = confirmPasswordInput.value.length > 0;

        if (!isMatch && isConfirmNotEmpty) {
            errorElement.classList.remove('hidden');
            errorElement.innerText = ERROR_MESSAGES.PASSWORD_MISMATCH;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            errorElement.classList.add('hidden');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    };
    passwordInput.addEventListener('input', validateMatch);
    confirmPasswordInput.addEventListener('input', validateMatch);
};

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button'); // Login button

        try {
            toggleLoading(btn, true, 'Logging in...');
            const data = await apiRequest(ENDPOINTS.TOKEN, {
                method: 'POST',
                body: JSON.stringify({ username: email, password })
            });
            
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token);
            localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
            
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            toggleLoading(btn, false);
        }
    });
}

// Handle Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const btn = registerForm.querySelector('button'); // Register button

        if (password !== confirmPassword) {
            return showAlert(ERROR_MESSAGES.PASSWORD_MISMATCH, 'error');
        }

        // Ensure password isn't "Too Short" or "Weak"
        if (password.length < 8) {
            return showAlert("Password must be at least 8 characters long", 'error');
        }

        try {
            toggleLoading(btn, true, 'Creating Account...');
            await apiRequest(ENDPOINTS.REGISTER, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            showAlert(SUCCESS_MESSAGES.ACCOUNT_CREATED, "success");
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            toggleLoading(btn, false);
        }
    });
}

// Handle Logout
const handleLogout = () => logoutUser();

// UI Auth State Sync
const syncAuthState = () => {
    const userEmailEl = document.getElementById('user-email');
    const authLinks = document.getElementById('auth-links');
    const loggedIn = isAuthenticated();
    const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_CONFIG.DEFAULT;
    
    if (loggedIn) { // User is logged in
        if (userEmailEl) userEmailEl.innerText = localStorage.getItem(STORAGE_KEYS.USER_EMAIL); // Display email
        if (authLinks) {
            const themeIcon = currentTheme === THEME_CONFIG.DARK ? 'fa-sun' : 'fa-moon';
            
            authLinks.innerHTML = `
                <div class="hidden md:flex items-center space-x-8 text-sm mr-4">
                    <a href="browse.html" class="hover:text-[#FACC15] transition">Browse Wishes</a>
                    <a href="create-wish.html" class="hover:text-[#FACC15] transition">Post a Wish</a>
                    <a href="dashboard.html" class="hover:text-[#FACC15] transition">My Impact</a>
                </div>
                <button id="theme-toggle" class="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:opacity-80 transition">
                    <i class="fas ${themeIcon}"></i>
                </button>
                <a href="dashboard.html" class="text-primary-dark font-semibold">Dashboard</a>
                <button id="logout-btn" class="text-sm hover:text-[#FACC15] transition">Log out</button>
            `;
        }
    } 

    // Conditional Redirection Logic (Protected Routes)
    const path = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'register.html'];
    const protectedPages = ['dashboard.html', 'create-wish.html'];

    if (loggedIn && publicPages.includes(path)) { 
        // If logged in, don't show login/register
        window.location.href = 'dashboard.html';
    } else if (!loggedIn && protectedPages.includes(path)) { 
        // If not logged in, protect certain pages
        window.location.href = 'login.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State Sync
    syncAuthState();

    // 2. Global UI Listeners (Using Event Delegation for dynamic elements)
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#theme-toggle')) toggleTheme();
        if (e.target.closest('#logout-btn')) handleLogout();
    });

    // 3. Form-specific Helpers
    setupPasswordToggle('password', 'toggle-password');
    setupPasswordToggle('confirm-password', 'toggle-confirm-password');
    setupPasswordMatchValidation('password', 'confirm-password', 'password-match-error', '#register-form button[type="submit"]');
    setupPasswordStrength('password', 'strength-meter', 'strength-text');
});
