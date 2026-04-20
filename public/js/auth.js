import { apiRequest, showAlert, toggleLoading, toggleTheme, isAuthenticated, logoutUser } from './utils.js';

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
            const data = await apiRequest('/token/', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            localStorage.setItem('token', data.access);
            localStorage.setItem('user_email', email);
            
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
            await apiRequest('/register/', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            showAlert("Account created! Please login.", "success");
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
    
    if (loggedIn) { // User is logged in
        if (userEmailEl) userEmailEl.innerText = localStorage.getItem('user_email'); // Display email
        if (authLinks) {
            authLinks.innerHTML = `
                <div class="hidden md:flex items-center space-x-8 text-sm mr-4">
                    <a href="browse.html" class="hover:text-[#FACC15] transition">Browse Wishes</a>
                    <a href="create-wish.html" class="hover:text-[#FACC15] transition">Post a Wish</a>
                    <a href="dashboard.html" class="hover:text-[#FACC15] transition">My Impact</a>
                </div>
                <button id="theme-toggle" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition">
                    <i class="fas fa-sun"></i>
                </button>
                <a href="dashboard.html" class="text-primary-dark font-semibold">Dashboard</a>
                <button id="logout-btn" class="text-sm hover:text-[#FACC15] transition">Log out</button>
            `;
            document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
            document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
        }
    } // Else: User is NOT logged in. Default auth links (Login/Register) will remain.

    // Conditional Redirection Logic (Protected Routes)
    const path = window.location.pathname;
    if (loggedIn && (path.includes('login.html') || path.includes('register.html'))) { // If logged in, don't show login/register
        window.location.href = 'dashboard.html';
    } else if (!loggedIn && (path.includes('dashboard.html') || path.includes('create-wish.html'))) { // If not logged in, protect certain pages
        window.location.href = 'login.html';
    }
};

document.addEventListener('DOMContentLoaded', syncAuthState);
