// WebRTC Voice/Video functionality
const voiceModal = document.getElementById('voice-modal');
const voiceCallBtn = document.getElementById('voice-call-btn');
const toggleMuteBtn = document.getElementById('toggle-mute');
const toggleDeafenBtn = document.getElementById('toggle-deafen');
const leaveVoiceBtn = document.getElementById('leave-voice');
const voiceUsersContainer = document.getElementById('voice-users');

let currentVoiceChannel = null;
let localStream = null;
let peerConnections = new Map();
let isMuted = false;
let isDeafened = false;

// ICE servers configuration
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Join voice channel
async function joinVoiceChannel(channelId) {
    try {
        // Get user media
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        currentVoiceChannel = channelId;
        
        // Emit join event
        socket.emit('voice:join', { channelId });

        // Show voice modal
        voiceModal.classList.remove('hidden');

        console.log('✅ Joined voice channel');
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check permissions.');
    }
}

// Leave voice channel
function leaveVoiceChannel() {
    if (!currentVoiceChannel) return;

    // Close all peer connections
    peerConnections.forEach(pc => pc.close());
    peerConnections.clear();

    // Stop local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    // Emit leave event
    socket.emit('voice:leave', { channelId: currentVoiceChannel });

    currentVoiceChannel = null;
    voiceModal.classList.add('hidden');

    console.log('❌ Left voice channel');
}

// Create peer connection
async function createPeerConnection(userId) {
    const pc = new RTCPeerConnection(iceServers);

    // Add local stream
    if (localStream) {
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('webrtc:ice-candidate', {
                targetUserId: userId,
                candidate: event.candidate
            });
        }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
        console.log('📡 Received remote track from user:', userId);
        
        // Create or update audio element for remote user
        let audioEl = document.getElementById(`audio-${userId}`);
        if (!audioEl) {
            audioEl = document.createElement('audio');
            audioEl.id = `audio-${userId}`;
            audioEl.autoplay = true;
            document.body.appendChild(audioEl);
        }
        
        audioEl.srcObject = event.streams[0];
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${userId}:`, pc.connectionState);
        
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            removePeerConnection(userId);
        }
    };

    peerConnections.set(userId, pc);
    return pc;
}

// Remove peer connection
function removePeerConnection(userId) {
    const pc = peerConnections.get(userId);
    if (pc) {
        pc.close();
        peerConnections.delete(userId);
    }

    // Remove audio element
    const audioEl = document.getElementById(`audio-${userId}`);
    if (audioEl) {
        audioEl.remove();
    }
}

// Socket events for WebRTC
socket.on('voice:user-joined', async (data) => {
    console.log('👤 User joined voice:', data.username);
    
    // Create peer connection and send offer
    const pc = await createPeerConnection(data.userId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('webrtc:offer', {
        targetUserId: data.userId,
        offer: offer
    });

    updateVoiceUsersList();
});

socket.on('voice:user-left', (data) => {
    console.log('👤 User left voice:', data.userId);
    removePeerConnection(data.userId);
    updateVoiceUsersList();
});

socket.on('voice:users-list', async (users) => {
    console.log('📋 Users in voice channel:', users);
    
    // Create peer connections for existing users
    for (const user of users) {
        await createPeerConnection(user.userId);
    }
    
    updateVoiceUsersList();
});

socket.on('webrtc:offer', async (data) => {
    console.log('📨 Received offer from:', data.fromUserId);
    
    const pc = await createPeerConnection(data.fromUserId);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('webrtc:answer', {
        targetUserId: data.fromUserId,
        answer: answer
    });
});

socket.on('webrtc:answer', async (data) => {
    console.log('📨 Received answer from:', data.fromUserId);
    
    const pc = peerConnections.get(data.fromUserId);
    if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
});

socket.on('webrtc:ice-candidate', async (data) => {
    const pc = peerConnections.get(data.fromUserId);
    if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});

// Update voice users list
function updateVoiceUsersList() {
    const users = Array.from(peerConnections.keys());
    
    voiceUsersContainer.innerHTML = `
        <div class="voice-user">
            <span class="user-avatar">${user.username.charAt(0).toUpperCase()}</span>
            <span class="user-name">You ${isMuted ? '(Muted)' : ''} ${isDeafened ? '(Deafened)' : ''}</span>
            <button class="mute-btn">${isMuted ? '🔇' : '🎤'}</button>
        </div>
        ${users.map(userId => `
            <div class="voice-user">
                <span class="user-avatar">U</span>
                <span class="user-name">User ${userId.substring(0, 8)}</span>
                <button class="mute-btn">🎤</button>
            </div>
        `).join('')}
    `;
}

// Voice controls
voiceCallBtn.addEventListener('click', () => {
    if (currentChannel && (currentChannel.type === 'VOICE' || currentChannel.type === 'VIDEO')) {
        joinVoiceChannel(currentChannel.id);
    } else {
        alert('Please select a voice channel first');
    }
});

toggleMuteBtn.addEventListener('click', () => {
    if (!localStream) return;

    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
    });

    toggleMuteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    updateVoiceUsersList();
});

toggleDeafenBtn.addEventListener('click', () => {
    isDeafened = !isDeafened;

    // Mute all audio elements
    document.querySelectorAll('audio[id^="audio-"]').forEach(audio => {
        audio.muted = isDeafened;
    });

    // Also mute local mic when deafened
    if (isDeafened && !isMuted) {
        toggleMuteBtn.click();
    }

    toggleDeafenBtn.textContent = isDeafened ? 'Undeafen' : 'Deafen';
    updateVoiceUsersList();
});

leaveVoiceBtn.addEventListener('click', () => {
    leaveVoiceChannel();
});

// Close modal on outside click
voiceModal.addEventListener('click', (e) => {
    if (e.target === voiceModal) {
        leaveVoiceChannel();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (currentVoiceChannel) {
        leaveVoiceChannel();
    }
});
