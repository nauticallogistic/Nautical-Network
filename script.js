document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const fileUploadBtn = document.getElementById('file-upload-btn');
    const fileUploadInput = document.getElementById('file-upload');
    const locationBtn = document.getElementById('location-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const languageSelector = document.getElementById('language-selector');
    
    // API Configuration
    const API_KEY = "AIzaSyCIrO5aaf8Y9_bCL_bt9dBKHt21TSDeWC0";
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;
    
    // Chat state
    let currentLanguage = 'en';
    let chatHistory = [];
    
    // Initialize the chat
    initChat();
    
    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    fileUploadBtn.addEventListener('click', function() {
        fileUploadInput.click();
    });
    
    fileUploadInput.addEventListener('change', handleFileUpload);
    
    locationBtn.addEventListener('click', shareLocation);
    
    languageSelector.addEventListener('change', function() {
        currentLanguage = this.value;
        // In a real app, you would update the UI language here
        addBotMessage(currentLanguage === 'en' ? 
            "Language changed to English. How can I assist you?" : 
            "භාෂාව ඉංග්‍රීසි බවට වෙනස් කරන ලදී. මට ඔබට උදව් කළ හැක්කේ කෙසේද?");
    });
    
    // Quick reply buttons (delegated event listener)
    chatMessages.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-reply')) {
            const message = e.target.textContent;
            addUserMessage(message);
            processUserMessage(message);
        }
    });
    
    // Functions
    function initChat() {
        // In a real app, you might load previous chat history here
        chatHistory = [
            { role: 'bot', content: 'Welcome to Nautical Network! How can I assist you with your logistics needs today?' }
        ];
    }
    
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
        chatMessages.appendChild(messageDiv);
        chatHistory.push({ role: 'user', content: message });
        scrollToBottom();
    }
    
    function addBotMessage(message, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        let content = `<div class="message-content"><p>${message}</p>`;
        
        if (options.quickReplies) {
            content += '<div class="quick-replies">';
            options.quickReplies.forEach(reply => {
                content += `<button class="quick-reply">${reply}</button>`;
            });
            content += '</div>';
        }
        
        if (options.document) {
            content += `
                <div class="document-card">
                    <i class="fas fa-file-${options.document.type}"></i>
                    <div class="document-info">
                        <div class="document-name">${options.document.name}</div>
                        <div class="document-size">${formatFileSize(options.document.size)}</div>
                    </div>
                </div>
            `;
        }
        
        content += '</div>';
        messageDiv.innerHTML = content;
        
        chatMessages.appendChild(messageDiv);
        chatHistory.push({ role: 'bot', content: message });
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        scrollToBottom();
    }
    
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addUserMessage(message);
            userInput.value = '';
            processUserMessage(message);
        }
    }
    
    async function processUserMessage(message) {
        showTypingIndicator();
        
        try {
            // In a real app, you would first detect intent here
            // For demo purposes, we'll simulate some responses
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simple intent detection
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
                addBotMessage("To track your order, please provide your tracking number or order ID.", {
                    quickReplies: ["I don't have it", "Cancel"]
                });
            } 
            else if (lowerMessage.includes('schedule') || lowerMessage.includes('delivery')) {
                addBotMessage("I can help you schedule a delivery. Please provide your order details and preferred date.", {
                    quickReplies: ["Today", "Tomorrow", "Next Week"]
                });
            }
            else if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
                addBotMessage("For inventory inquiries, please provide the SKU number or product name.", {
                    quickReplies: ["SKU123", "SKU456", "Nevermind"]
                });
            }
            else {
                // For other messages, use the Gemini API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are Nautical Network, a logistics chatbot. Respond to this message professionally and helpfully: ${message}`
                            }]
                        }]
                    })
                });
                
                const data = await response.json();
                const botResponse = data.candidates[0].content.parts[0].text;
                addBotMessage(botResponse);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            addBotMessage("I'm having trouble processing your request. Please try again later.");
        } finally {
            hideTypingIndicator();
        }
    }
    
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        
        if (!validTypes.includes(file.type)) {
            addBotMessage("Sorry, I can only accept PDF, JPG, PNG, DOCX, or XLSX files.");
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            addBotMessage("File is too large. Please upload files smaller than 5MB.");
            return;
        }
        
        // Determine file type icon
        let fileType = 'alt'; // default
        if (file.type.includes('pdf')) fileType = 'pdf';
        else if (file.type.includes('image')) fileType = 'image';
        else if (file.type.includes('word')) fileType = 'word';
        else if (file.type.includes('spreadsheet')) fileType = 'excel';
        
        // Add message with file info
        addUserMessage("I've uploaded a document");
        addBotMessage("I've received your document. How would you like me to process it?", {
            document: {
                name: file.name,
                size: file.size,
                type: fileType
            },
            quickReplies: ["Extract information", "Store for reference", "Nevermind"]
        });
        
        // In a real app, you would upload the file to your server here
    }
    
    function shareLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    addUserMessage("Here's my location");
                    addBotMessage(`I've received your location (Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}). How can I help with this location?`, {
                        quickReplies: ["Schedule pickup", "Find nearest warehouse", "Nevermind"]
                    });
                    
                    // In a real app, you might show a map here
                },
                error => {
                    addBotMessage("Couldn't access your location. Please make sure location services are enabled.");
                }
            );
        } else {
            addBotMessage("Location services are not supported by your browser.");
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});