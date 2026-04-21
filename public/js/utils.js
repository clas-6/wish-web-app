import { API_CONFIG, STORAGE_KEYS, UI_CONFIG, THEME_CONFIG, OCCASION_CONFIG } from './constants.js';

const API_BASE_URL = location.hostname === "localhost" || location.hostname === "127.0.0.1" 
    ? API_CONFIG.BASE_URL 
    : "https://api.your-domain.com/api";

// Centralized logout logic
export const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    window.location.href = 'index.html';
};

// Helper for API requests
export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN); // For JWT Auth
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        if (response.status === 401) {
            logoutUser();
            throw new Error("Session expired. Please log in again.");
        }
        const error = await response.json();
        throw new Error(error.detail || error.message || "Something went wrong");
    }
    return response.json();
};

export const isAuthenticated = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) !== null;
};

// Helper for UI state
export const toggleLoading = (button, isLoading, text = "Loading...") => {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerText;
        button.innerText = text;
        button.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
        button.disabled = false;
        button.innerText = button.dataset.originalText || button.innerText;
        button.classList.remove('opacity-70', 'cursor-not-allowed');
    }
};

export const showAlert = (message, type = 'info') => {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    
    const bgClass = type === 'success' ? 'bg-green-500/20 border-green-500/50' : 
                    type === 'error' ? 'bg-red-500/20 border-red-500/50' : 
                    'bg-blue-500/20 border-blue-500/50';
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';

    toast.className = `flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-slide-in-right ${bgClass} text-inherit min-w-[300px] pointer-events-auto`;
    toast.innerHTML = `
        <i class="fas ${icon} text-lg ${type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400'}"></i>
        <p class="text-sm font-medium">${message}</p>
    `;

    container.appendChild(toast);

    // Remove toast after delay
    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 500);
    }, UI_CONFIG.TOAST_DURATION);
};

const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    // Using inline styles for dynamic config to avoid Tailwind JIT issues with arbitrary values
    container.style.position = 'fixed';
    container.style.top = UI_CONFIG.TOAST_POSITION.top;
    container.style.right = UI_CONFIG.TOAST_POSITION.right;
    container.className = 'z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
    return container;
};


// ====================== THEME MANAGEMENT ======================
export const initTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || THEME_CONFIG.DEFAULT;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    applyOccasionTheme();
    initCountdown();
};

const initCountdown = () => {
    const countdownEl = document.getElementById('occasion-countdown');
    if (!countdownEl) return;

    const now = new Date();
    let nextOccasion = null;
    let minDiff = Infinity;

    // Find the next upcoming occasion
    for (const key in OCCASION_CONFIG) {
        const config = OCCASION_CONFIG[key];
        let targetDate = new Date(now.getFullYear(), config.start.month - 1, config.start.day);
        
        // If the date has passed this year, look at next year
        if (targetDate < now) {
            targetDate.setFullYear(now.getFullYear() + 1);
        }

        const diff = targetDate - now;
        if (diff < minDiff) {
            minDiff = diff;
            nextOccasion = {
                name: key.replace('_', ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                targetDate
            };
        }
    }

    // Only show countdown if the next occasion is within 30 days
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (nextOccasion && minDiff < thirtyDaysInMs) {
        countdownEl.classList.remove('hidden');
        document.getElementById('countdown-label').innerText = `Countdown to ${nextOccasion.name}`;

        const updateTimer = () => {
            const currentTime = new Date();
            const remaining = nextOccasion.targetDate - currentTime;

            if (remaining <= 0) {
                clearInterval(timerInterval);
                location.reload(); // Reload to trigger the actual occasion theme
                return;
            }

            const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);

            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = String(val).padStart(2, '0');
            };

            setVal('cd-days', d);
            setVal('cd-hours', h);
            setVal('cd-minutes', m);
            setVal('cd-seconds', s);
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }
};

const applyOccasionTheme = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    let activeOccasion = null;

    for (const key in OCCASION_CONFIG) {
        const config = OCCASION_CONFIG[key];
        const isCrossingYear = config.start.month > config.end.month;

        const isActive = isCrossingYear 
            ? (month === config.start.month && day >= config.start.day) || (month === config.end.month && day <= config.end.day)
            : (month === config.start.month && day >= config.start.day && day <= config.end.day);

        if (isActive) {
            activeOccasion = config.id;
            break;
        }
    }

    if (activeOccasion) {
        document.documentElement.setAttribute('data-occasion', activeOccasion);
        if (activeOccasion === 'valentine') {
            startValentineHearts();
        }
    }
};

const startValentineHearts = () => {
    setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        const heart = document.createElement('i');
        heart.className = 'fas fa-heart heart-particle';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        heart.style.fontSize = (Math.random() * 1 + 0.5) + 'rem';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 7000);
    }, 800);
};

export const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEME_CONFIG.DARK ? THEME_CONFIG.LIGHT : THEME_CONFIG.DARK;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    icon.className = theme === THEME_CONFIG.DARK ? 'fas fa-sun' : 'fas fa-moon';
};

export const triggerConfetti = () => {
    if (window.confetti) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#60a5fa', '#facc15', '#1e3a8a']
        });
    }
};

export const shareWish = (id, type, amount) => {
    const url = `${window.location.origin}/browse.html?wish=${id}`;
    const text = `Help grant this wish for ₦${amount} ${type} on WISH 💛`;
    
    if (navigator.share) {
        navigator.share({ title: 'WISH', text, url });
    } else {
        navigator.clipboard.writeText(`${text} ${url}`);
        showAlert("Link copied to clipboard!", "success");
    }
};

// Expose to window for HTML onclick handlers
window.shareWish = shareWish;
window.triggerConfetti = triggerConfetti;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});
