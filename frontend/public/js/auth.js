import { apiRequest, showAlert, toggleLoading, isAuthenticated, logoutUser } from './utils.js';
import { ENDPOINTS, STORAGE_KEYS, SUCCESS_MESSAGES, PASSWORD_STRENGTH, ERROR_MESSAGES, UI_CONFIG } from './constants.js';

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
            localStorage.setItem(STORAGE_KEYS.USER_ID, data.user_id);
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
    const authBtnContainer = document.querySelector('.auth-buttons-container');
    const heroBtn = document.getElementById('hero-get-started');
    const loggedIn = isAuthenticated();
    
    if (loggedIn) { // User is logged in
        if (userEmailEl) userEmailEl.innerText = localStorage.getItem(STORAGE_KEYS.USER_EMAIL); // Display email
        if (authBtnContainer) {
            authBtnContainer.innerHTML = `
                <a href="create-wish.html" class="hidden md:block px-4 py-2 bg-[#FACC15] text-[#1a1a1a] rounded-xl text-xs font-bold hover:bg-[#eab308] transition shadow-md">Post a Wish</a>
                <div class="relative">
                    <button id="profile-menu-btn" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085] hover:bg-[#eaecf0] transition p-2">
                        <i class="fas fa-user-astronaut"></i>
                    </button>
                    <div id="profile-dropdown" class="hidden absolute top-12 right-0 w-48 furni-card !p-2 z-[60] animate-fade-in !bg-[var(--card-bg)] shadow-2xl">
                        <div class="flex flex-col gap-1">
                            <a href="dashboard.html" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition">
                                <i class="fas fa-user w-5 text-center opacity-70"></i> <span>My Profile</span>
                            </a>
                            <a href="dashboard.html" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition">
                                <i class="fas fa-star w-5 text-center opacity-70"></i> <span>My Wishes</span>
                            </a>
                            <a href="transactions.html" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition">
                                <i class="fas fa-list-ul w-5 text-center opacity-70"></i> <span>History</span>
                            </a>
                            <a href="settings.html" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition">
                                <i class="fas fa-cog w-5 text-center opacity-70"></i> <span>Settings</span>
                            </a>
                            <button id="logout-btn" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition text-red-400">
                                <i class="fas fa-sign-out-alt w-5 text-center"></i> <span>Log out</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        if (heroBtn) {
            heroBtn.innerText = 'Make a Wish';
            heroBtn.href = 'create-wish.html';
        }
    } else {
        if (heroBtn) {
            heroBtn.innerText = 'Get Started';
            heroBtn.href = 'register.html';
        }
        if (authBtnContainer) {
            authBtnContainer.innerHTML = `
                <a href="login.html" class="hidden xs:block text-sm text-[#667085] hover:text-[#1a1a1a] transition">Login</a>
                <a href="register.html" class="px-4 py-2 bg-[#FACC15] text-[#1a1a1a] font-semibold rounded-xl text-xs sm:text-sm hover:bg-[#eab308] transition">Get Started</a>
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
        // Profile Menu Toggle and Logout
        const profileMenuBtn = e.target.closest('#profile-menu-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        const logoutBtn = e.target.closest('#logout-btn');
        
        // Mobile Menu Toggle
        const mobileMenuBtn = e.target.closest('#mobile-menu-btn');
        const mobileDropdown = document.getElementById('mobile-dropdown');
        
        if (mobileMenuBtn && mobileDropdown) {
            mobileDropdown.classList.toggle(UI_CONFIG.MOBILE_MENU_CLOSED_CLASS);
            mobileDropdown.classList.toggle(UI_CONFIG.MOBILE_MENU_OPEN_CLASS);
        } else if (mobileDropdown && !e.target.closest('#mobile-dropdown') && !mobileDropdown.classList.contains(UI_CONFIG.MOBILE_MENU_CLOSED_CLASS)) {
            mobileDropdown.classList.add(UI_CONFIG.MOBILE_MENU_CLOSED_CLASS);
            mobileDropdown.classList.remove(UI_CONFIG.MOBILE_MENU_OPEN_CLASS);
        }

        if (profileMenuBtn && profileDropdown) {
            profileDropdown.classList.toggle('hidden');
        } else if (profileDropdown && !e.target.closest('#profile-dropdown')) { // Clicked outside
            profileDropdown.classList.add('hidden');
        } else if (logoutBtn) { // Clicked logout button inside dropdown
            handleLogout();
        }
    });

    // 3. Form-specific Helpers
    setupPasswordToggle('password', 'toggle-password');
    setupPasswordToggle('confirm-password', 'toggle-confirm-password');
    setupPasswordMatchValidation('password', 'confirm-password', 'password-match-error', '#register-form button[type="submit"]');
    setupPasswordStrength('password', 'strength-meter', 'strength-text');
});
