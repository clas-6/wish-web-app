import { apiRequest, showAlert, toggleLoading, toggleTheme, isAuthenticated, logoutUser, initTheme } from './utils.js';
import { ENDPOINTS, STORAGE_KEYS, SUCCESS_MESSAGES, THEME_CONFIG } from './constants.js';

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
                body: JSON.stringify({ email, password })
            });
            
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.access);
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
            return showAlert("Passwords do not match", 'error');
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

    // Re-attach listeners to the (potentially new) navbar elements
    document.getElementById('theme-toggle')?.removeEventListener('click', toggleTheme);
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('logout-btn')?.removeEventListener('click', handleLogout);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Conditional Redirection Logic (Protected Routes)
    const path = window.location.pathname;
    if (loggedIn && (path.includes('login.html') || path.includes('register.html'))) { // If logged in, don't show login/register
        window.location.href = 'dashboard.html';
    } else if (!loggedIn && (path.includes('dashboard.html') || path.includes('create-wish.html'))) { // If not logged in, protect certain pages
        window.location.href = 'login.html';
    }
};

document.addEventListener('DOMContentLoaded', syncAuthState);
