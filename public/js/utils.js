// Firebase Configuration (Replace with your own config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

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
    // Simple alert for now, can be replaced with a better toast UI
    alert(`${type.toUpperCase()}: ${message}`);
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

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    initTheme();
});

export { auth, db, functions, httpsCallable, onAuthStateChanged, signOut };
