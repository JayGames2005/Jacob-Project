// Chat functionality
let typingTimeout = null;
const typingIndicator = document.getElementById('typing-indicator');
const typingUsers = document.getElementById('typing-users');

// Load messages
async function loadMessages(channelId) {
    try {
        const messages = await apiRequest(`/api/messages/${channelId}`);
        renderMessages(messages);
        scrollToBottom();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Render messages
function renderMessages(messages) {
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to #${currentChannel.name}</h2>
                <p>This is the start of the #${currentChannel.name} channel.</p>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = messages.map(msg => {
        const initial = (msg.display_name || msg.username).charAt(0).toUpperCase();
        const timestamp = new Date(msg.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });

        return `
            <div class="message" data-message-id="${msg.id}">
                <div class="message-avatar">
                    ${msg.avatar ? `<img src="${msg.avatar}" alt="${msg.username}">` : initial}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${msg.display_name || msg.username}</span>
                        <span class="message-timestamp">${timestamp}</span>
                    </div>
                    <div class="message-text">${escapeHtml(msg.content)}</div>
                    ${msg.attachments && JSON.parse(msg.attachments).length > 0 ? renderAttachments(JSON.parse(msg.attachments)) : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Render attachments
function renderAttachments(attachments) {
    return `
        <div class="message-attachments">
            ${attachments.map(att => {
                if (att.type?.startsWith('image/')) {
                    return `<img src="${att.url}" alt="Attachment" style="max-width: 400px; border-radius: 4px; margin-top: 4px;">`;
                } else {
                    return `<a href="${att.url}" target="_blank">${att.name}</a>`;
                }
            }).join('')}
        </div>
    `;
}

// Add message to UI
function addMessage(message) {
    const initial = (message.display_name || message.username).charAt(0).toUpperCase();
    const timestamp = new Date(message.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.dataset.messageId = message.id;
    messageEl.innerHTML = `
        <div class="message-avatar">
            ${message.avatar ? `<img src="${message.avatar}" alt="${message.username}">` : initial}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${message.display_name || message.username}</span>
                <span class="message-timestamp">${timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(message.content)}</div>
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
}

// Send message
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const content = messageInput.value.trim();

    if (!content || !currentChannel) return;

    socket.emit('message:send', {
        channelId: currentChannel.id,
        content: content,
        attachments: []
    });

    messageInput.value = '';
    stopTyping();
}

// Typing indicator
messageInput.addEventListener('input', () => {
    if (!currentChannel) return;

    startTyping();

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        stopTyping();
    }, 3000);
});

function startTyping() {
    if (!currentChannel) return;
    socket.emit('typing:start', currentChannel.id);
}

function stopTyping() {
    if (!currentChannel) return;
    socket.emit('typing:stop', currentChannel.id);
}

// Socket events for chat
socket.on('message:new', (message) => {
    if (message.channel_id === currentChannel?.id) {
        addMessage(message);
    }
});

socket.on('typing:start', (data) => {
    if (data.channelId === currentChannel?.id && data.userId !== user.id) {
        typingUsers.textContent = data.username;
        typingIndicator.classList.remove('hidden');
    }
});

socket.on('typing:stop', (data) => {
    if (data.channelId === currentChannel?.id) {
        typingIndicator.classList.add('hidden');
    }
});

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Emoji button (simple implementation)
document.querySelector('.emoji-button').addEventListener('click', () => {
    const emojis = ['😀', '😂', '😊', '😍', '🎉', '👍', '❤️', '🔥'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    messageInput.value += emoji;
    messageInput.focus();
});

// File attachment (simple implementation)
document.querySelector('.attach-button').addEventListener('click', () => {
    alert('File upload feature - connect to file upload endpoint');
    // In a full implementation, this would open a file picker
    // and upload files to the server
});
