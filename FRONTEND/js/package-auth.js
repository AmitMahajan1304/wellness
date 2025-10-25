import { showPage, showToast, showView } from './main.js';

// UPDATED: Use environment variable in production, localhost in development
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://your-backend-url.onrender.com'; // We'll update this after deployment

export async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    console.log('Email input:', document.getElementById('email'));
    console.log('Password input:', document.getElementById('password'));
    console.log('Submit button:', e.target.querySelector('button[type="submit"]'));
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Login failed', 'error');
            return; 
        }

        // Save token
        localStorage.setItem('wellness-token', data.token);
        localStorage.setItem('user-email', email);
        
        // Update UI
        const emailDisplay = document.getElementById('user-email-display');
        if (emailDisplay) emailDisplay.textContent = email;

        console.log("Login successful!");
        
        // Show main app
        showView('app');
        showPage('dashboard-page');
        showToast('Welcome back!', 'success');

    } catch (err) {
        console.error('Login Error:', err);
        showToast('Cannot connect to server. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

export async function handleSignup(e) {
    e.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Signup failed', 'error');
            return;
        }

        showToast('Account created! Please log in.', 'success');
        toggleToLogin();

    } catch (err) {
        console.error('Signup Error:', err);
        showToast('Cannot connect to server. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

export function handleLogout(e) {
    e.preventDefault();
    
    localStorage.removeItem('wellness-token');
    localStorage.removeItem('user-email');
    
    console.log("Logged out");
    showView('login');
    showToast('Logged out successfully', 'success');
}

export function toggleToLogin(e) {
    if (e) e.preventDefault();
    showView('login');
}

export function toggleToSignup(e) {
    if (e) e.preventDefault();
    showView('signup');
}
