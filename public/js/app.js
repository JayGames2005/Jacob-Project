// Main app logic
const API_URL = window.location.origin;
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Redirect if not logged in
if (!token || !user.id) {
    window.location.href = '/';
}

// Socket.io connection
const socket = io({
    auth: {
        token: token
    }
});

// State
let currentServer = null;
let currentChannel = null;
let servers = [];
let channels = [];
let members = [];

// DOM Elements
const serversContainer = document.getElementById('servers-container');
const channelsContainer = document.getElementById('channels-container');
const serverNameEl = document.getElementById('server-name');
const currentChannelEl = document.getElementById('current-channel');
const messagesContainer = document.getElementById('messages-container');
const membersList = document.getElementById('members-list');
const messageInput = document.getElementById('message-input');

// Modals
const createServerModal = document.getElementById('create-server-modal');
const joinServerModal = document.getElementById('join-server-modal');
const addServerBtn = document.getElementById('add-server-btn');
const joinServerBtn = document.getElementById('join-server-btn');
const cancelServerBtn = document.getElementById('cancel-server-btn');
const cancelJoinBtn = document.getElementById('cancel-join-btn');
const createServerForm = document.getElementById('create-server-form');
const joinServerForm = document.getElementById('join-server-form');

// Socket events
socket.on('connect', () => {
    console.log('✅ Connected to server');
    socket.emit('join:servers');
    loadServers();
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

socket.on('user:status', (data) => {
    updateUserStatus(data.userId, data.status);
});

// API Helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Load servers
async function loadServers() {
    try {
        servers = await apiRequest('/api/servers');
        renderServers();
        
        if (servers.length > 0 && !currentServer) {
            selectServer(servers[0].id);
        }
    } catch (error) {
        console.error('Error loading servers:', error);
    }
}

// Render servers
function renderServers() {
    serversContainer.innerHTML = servers.map(server => `
        <div class="server-icon ${currentServer?.id === server.id ? 'active' : ''}" 
             data-server-id="${server.id}"
             title="${server.name}">
            ${server.icon ? 
                `<img src="${server.icon}" alt="${server.name}">` : 
                `<span>${server.name.charAt(0).toUpperCase()}</span>`
            }
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.server-icon[data-server-id]').forEach(el => {
        el.addEventListener('click', () => {
            selectServer(el.dataset.serverId);
        });
    });
}

// Select server
async function selectServer(serverId) {
    try {
        const server = await apiRequest(`/api/servers/${serverId}`);
        currentServer = server;
        channels = server.channels || [];
        members = server.members || [];

        serverNameEl.textContent = server.name;
        renderChannels();
        renderMembers();
        renderServers();

        // Select first text channel
        const firstChannel = channels.find(ch => ch.type === 'TEXT');
        if (firstChannel) {
            selectChannel(firstChannel.id);
        }
    } catch (error) {
        console.error('Error selecting server:', error);
    }
}

// Render channels
function renderChannels() {
    const textChannels = channels.filter(ch => ch.type === 'TEXT');
    const voiceChannels = channels.filter(ch => ch.type === 'VOICE' || ch.type === 'VIDEO');

    channelsContainer.innerHTML = `
        ${textChannels.length > 0 ? `
            <div class="channel-category">
                <div class="category-header">
                    <span>TEXT CHANNELS</span>
                </div>
                ${textChannels.map(channel => `
                    <div class="channel-item ${currentChannel?.id === channel.id ? 'active' : ''}" 
                         data-channel-id="${channel.id}">
                        <span class="channel-icon">#</span>
                        <span class="channel-name">${channel.name}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${voiceChannels.length > 0 ? `
            <div class="channel-category">
                <div class="category-header">
                    <span>VOICE CHANNELS</span>
                </div>
                ${voiceChannels.map(channel => `
                    <div class="channel-item" data-channel-id="${channel.id}" data-channel-type="${channel.type}">
                        <span class="channel-icon">🔊</span>
                        <span class="channel-name">${channel.name}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;

    // Add click listeners
    document.querySelectorAll('.channel-item[data-channel-id]').forEach(el => {
        el.addEventListener('click', () => {
            if (el.dataset.channelType === 'VOICE' || el.dataset.channelType === 'VIDEO') {
                joinVoiceChannel(el.dataset.channelId);
            } else {
                selectChannel(el.dataset.channelId);
            }
        });
    });
}

// Select channel
async function selectChannel(channelId) {
    try {
        // Leave previous channel
        if (currentChannel) {
            socket.emit('channel:leave', currentChannel.id);
        }

        const channel = channels.find(ch => ch.id === channelId);
        currentChannel = channel;
        currentChannelEl.textContent = channel.name;

        // Join channel via socket
        socket.emit('channel:join', channelId);

        // Load messages
        await loadMessages(channelId);

        renderChannels();
    } catch (error) {
        console.error('Error selecting channel:', error);
    }
}

// Render members
function renderMembers() {
    if (members.length === 0) {
        membersList.innerHTML = '<div class="empty-state">No members</div>';
        return;
    }

    membersList.innerHTML = members.map(member => {
        const initial = (member.display_name || member.username).charAt(0).toUpperCase();
        return `
            <div class="member-item">
                <div class="member-avatar">
                    ${member.avatar ? `<img src="${member.avatar}" alt="${member.username}">` : initial}
                    <span class="member-status ${member.status.toLowerCase()}"></span>
                </div>
                <span class="member-name">${member.display_name || member.username}</span>
            </div>
        `;
    }).join('');
}

// Update user status
function updateUserStatus(userId, status) {
    const member = members.find(m => m.id === userId);
    if (member) {
        member.status = status;
        renderMembers();
    }
}

// Modals
addServerBtn.addEventListener('click', () => {
    createServerModal.classList.remove('hidden');
});

joinServerBtn.addEventListener('click', () => {
    joinServerModal.classList.remove('hidden');
});

cancelServerBtn.addEventListener('click', () => {
    createServerModal.classList.add('hidden');
});

cancelJoinBtn.addEventListener('click', () => {
    joinServerModal.classList.add('hidden');
});

// Create server
createServerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('server-name-input').value;
    const description = document.getElementById('server-description-input').value;

    try {
        const server = await apiRequest('/api/servers', {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        });

        servers.push(server);
        renderServers();
        selectServer(server.id);

        createServerModal.classList.add('hidden');
        createServerForm.reset();
    } catch (error) {
        alert('Error creating server: ' + error.message);
    }
});

// Join server
joinServerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inviteCode = document.getElementById('invite-code-input').value;

    try {
        const result = await apiRequest(`/api/servers/join/${inviteCode}`, {
            method: 'POST',
        });

        servers.push(result.server);
        renderServers();
        selectServer(result.server.id);

        joinServerModal.classList.add('hidden');
        joinServerForm.reset();
    } catch (error) {
        alert('Error joining server: ' + error.message);
    }
});

// Close modals on outside click
[createServerModal, joinServerModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// Settings button
document.getElementById('settings-btn').addEventListener('click', () => {
    if (confirm('Do you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
});
