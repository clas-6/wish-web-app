// Firebase Configuration (Replace with your own config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// IMPORTANT: Replace these with your actual Firebase project configuration found in the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSy...", // Partner replaces this
  authDomain: "wish-app-xyz.firebaseapp.com",
  projectId: "wish-app-xyz",
  storageBucket: "wish-app-xyz.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Connect to emulators if running locally
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

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
    }, 4000);
};

const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    // Positioned below the navbar
    container.className = 'fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
    return container;
};


// ====================== THEME MANAGEMENT ======================
export const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
};

export const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    initTheme();
});

export { auth, db, functions, httpsCallable, onAuthStateChanged, signOut };
