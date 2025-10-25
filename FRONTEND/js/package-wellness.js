import { showToast, showPage } from './main.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://your-backend-url.onrender.com';

// --- Mood Logging ---
export function handleMoodSubmit(mood) {
    console.log(`Mood selected: ${mood}`);
    saveMood(mood);
}

async function saveMood(mood) {
    const token = localStorage.getItem('wellness-token');
    
    if (!token) {
        showToast('Please log in first', 'error');
        return;
    }

    const moodData = {
        mood: mood,
        date: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/mood`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(moodData)
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to save mood', 'error');
            return;
        }

        showToast('Mood logged successfully!', 'success');
        showPage('history-page');

    } catch (err) {
        console.error('Mood save error:', err);
        showToast('Cannot connect to server', 'error');
    }
}

// --- Journaling ---
export function handleJournalSubmit(e) {
    e.preventDefault();
    const entryInput = document.getElementById('journal-entry');
    const entry = entryInput.value.trim();

    if (entry) {
        saveJournalEntry(entry);
        entryInput.value = '';
    } else {
        showToast('Please write something first', 'error');
    }
}

async function saveJournalEntry(entry) {
    const token = localStorage.getItem('wellness-token');
    
    if (!token) {
        showToast('Please log in first', 'error');
        return;
    }

    const journalData = {
        entry: entry,
        date: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/journal`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(journalData)
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Failed to save entry', 'error');
            return;
        }

        showToast('Journal entry saved!', 'success');
        showPage('history-page');

    } catch (err) {
        console.error('Journal save error:', err);
        showToast('Cannot connect to server', 'error');
    }
}

// --- Chart Rendering ---
let moodChart = null;

export function renderMoodChart() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    const canvas = document.getElementById('moodChart');
    if (!canvas) {
        console.error('Chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Mock data for now - replace with real API call later
    const mockData = {
        labels: ['Oct 18', 'Oct 19', 'Oct 20', 'Oct 21', 'Oct 22', 'Oct 23', 'Oct 24'],
        data: [2, 1, 3, 2, 4, 3, 3]
    };

    if (moodChart) {
        moodChart.destroy();
    }

    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mockData.labels,
            datasets: [{
                label: 'Your Mood Over Time',
                data: mockData.data,
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            switch(value) {
                                case 1: return 'Terrible';
                                case 2: return 'Bad';
                                case 3: return 'Good';
                                case 4: return 'Great';
                                default: return '';
                            }
                        }
                    },
                    min: 0.5,
                    max: 4.5
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}