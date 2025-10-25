/*
=================================
Main Controller
- Handles page/view switching
- Handles main nav listeners
- Initializes the app
=================================
*/
import {
    handleLogin,
    handleSignup,
    handleLogout,
    toggleToLogin,
    toggleToSignup,
} from './package-auth.js';

import { handleChatSubmit } from './package-chatbot.js';
import { handleMoodSubmit, handleJournalSubmit } from './package-wellness.js';

// --- DOM Cache (Declare as let, assign in initializeApp) ---
// Views
let loginView = null;
let signupView = null;
let appView = null;

// All Pages (for switching)
let allPages = null;

// All Auth Forms
let loginForm = null;
let signupForm = null;

// All Nav Links
let navLinks = null;
let logoutButton = null;

// Toggle links
let showSignup = null;
let showLogin = null;

// --- State ---
let currentPage = 'dashboard-page';

// --- Toast / Pop-up ---
export let toastContainer = null;
export function showToast(message, type = 'success') {
    if (!toastContainer) return; // Fail silently if container not found
    
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- Page/View Controllers ---

/**
 * Shows a main "view" (app, login, or signup)
 * @param {'app' | 'login' | 'signup'} viewName
 */
export function showView(viewName) {
    // Hide all views
    if (loginView) loginView.classList.remove('active');
    if (signupView) signupView.classList.remove('active');
    if (appView) appView.classList.remove('active');

    // Show the one we want
    if (viewName === 'app' && appView) {
        appView.classList.add('active');
    } else if (viewName === 'signup' && signupView) {
        signupView.classList.add('active');
    } else if (loginView) { // Default to login
        loginView.classList.add('active');
    }
}

/**
 * Shows a specific page *within* the main app view
 * @param {string} pageId (e.g., 'dashboard-page')
 */
export function showPage(pageId) {
    if (!allPages) return;
    
    // 1. Hide all pages
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    // 2. Show the one page we want
    const newPage = document.getElementById(pageId);
    if (newPage) {
        newPage.classList.add('active');
        currentPage = pageId;
    }

    // 3. Update nav link styling
    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active'); // <-- FIX: Was classList.Add (uppercase)
        } else {
            link.classList.remove('active');
        }
    });
}

// --- Event Listeners ---

function setupEventListeners() {
    // --- Auth Listeners ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showSignup) showSignup.addEventListener('click', toggleToSignup);
    if (showLogin) showLogin.addEventListener('click', toggleToLogin);

    // --- Bottom Nav Listeners ---
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const pageId = link.dataset.page;
            if (pageId && pageId !== currentPage) {
                showPage(pageId);
            }
        });
    });

    // --- Form Listeners (from other packages) ---
    // We find the forms here in main.js, but the *handlers* are in the packages
    const chatForm = document.getElementById('chat-form');
    const moodSelector = document.getElementById('mood-selector');
    const journalForm = document.getElementById('journal-form');

    if (chatForm) chatForm.addEventListener('submit', handleChatSubmit);
    if (moodSelector) {
        moodSelector.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => handleMoodSubmit(btn.dataset.mood));
        });
    }
    if (journalForm) journalForm.addEventListener('submit', handleJournalSubmit);
}

// --- App Initialization ---

function initializeApp() {
    // --- Assign all DOM elements now that the DOM is loaded ---
    loginView = document.getElementById('login-view');
    signupView = document.getElementById('signup-view');
    appView = document.getElementById('app-view');
    allPages = document.querySelectorAll('.page');
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    navLinks = document.querySelectorAll('.nav-link');
    logoutButton = document.getElementById('logout-btn');
    showSignup = document.getElementById('show-signup-link');
    showLogin = document.getElementById('show-login-link');
    toastContainer = document.getElementById('toast-container');
    
    // Setup listeners *after* elements are found
    setupEventListeners();
    
    const token = localStorage.getItem('token');
    if (token) {
        // We have a token, so go to the app
        showView('app');
        showPage('dashboard-page');
    } else {
        // No token, show the login page
        showView('login');
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);

