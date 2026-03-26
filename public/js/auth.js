import { auth, onAuthStateChanged, signOut, showAlert, toggleLoading } from './utils.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button');

        try {
            toggleLoading(btn, true, 'Logging in...');
            await signInWithEmailAndPassword(auth, email, password);
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
        const btn = registerForm.querySelector('button');

        if (password !== confirmPassword) {
            return showAlert("Passwords do not match", 'error');
        }

        try {
            toggleLoading(btn, true, 'Creating Account...');
            await createUserWithEmailAndPassword(auth, email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            toggleLoading(btn, false);
        }
    });
}

// Handle Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    const userEmailEl = document.getElementById('user-email');
    const authLinks = document.getElementById('auth-links');
    
    if (user) {
        if (userEmailEl) userEmailEl.innerText = user.email;
        if (authLinks) {
            authLinks.innerHTML = `
                <a href="dashboard.html" class="text-blue-600 font-semibold">Dashboard</a>
            `;
        }
        
        // Redirect from login/register if already logged in
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // Redirect to login if on protected pages
        const protectedPages = ['dashboard.html', 'create-wish.html'];
        if (protectedPages.some(page => window.location.pathname.includes(page))) {
            window.location.href = 'login.html';
        }
    }
});
