import { showToast } from './main.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://your-backend-url.onrender.com';

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');

export function handleChatSubmit(e) {
    e.preventDefault();
    const message = chatInput.value.trim();

    if (message) {
        addChatMessage(message, 'user');
        chatInput.value = '';
        getBotResponse(message);
    }
}

function addChatMessage(message, sender) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('chat-message', `${sender}-message`);
    msgElement.textContent = message;
    chatMessages.appendChild(msgElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getBotResponse(userMessage) {
    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-message bot-message';
    typing.textContent = '...';
    typing.id = 'typing-indicator';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove typing indicator
    document.getElementById('typing-indicator')?.remove();

    // Mock response (replace with real API call)
    let botMessage = "I'm here to listen. Can you tell me more?";
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        botMessage = "Hello! How are you feeling today?";
    } else if (userMessage.toLowerCase().includes('sad')) {
        botMessage = "I'm sorry you're feeling sad. Would you like to talk about what's bothering you?";
    } else if (userMessage.toLowerCase().includes('happy')) {
        botMessage = "That's wonderful! What's making you feel happy?";
    }

    addChatMessage(botMessage, 'bot');
}
