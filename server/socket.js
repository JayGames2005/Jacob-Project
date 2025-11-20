const jwt = require('jsonwebtoken');
const db = require('./database');

const connectedUsers = new Map(); // userId -> socket

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.userId})`);
    
    connectedUsers.set(socket.userId, socket);

    // Update user status to online
    db.query('UPDATE users SET status = $1 WHERE id = $2', ['ONLINE', socket.userId]);

    // Broadcast user online status
    socket.broadcast.emit('user:status', {
      userId: socket.userId,
      status: 'ONLINE'
    });

    // Join user's servers
    socket.on('join:servers', async () => {
      try {
        const result = await db.query(
          `SELECT server_id FROM server_members WHERE user_id = $1`,
          [socket.userId]
        );
        
        result.rows.forEach(row => {
          socket.join(`server:${row.server_id}`);
        });
      } catch (error) {
        console.error('Join servers error:', error);
      }
    });

    // Join specific channel
    socket.on('channel:join', (channelId) => {
      socket.join(`channel:${channelId}`);
      console.log(`User ${socket.username} joined channel ${channelId}`);
    });

    // Leave channel
    socket.on('channel:leave', (channelId) => {
      socket.leave(`channel:${channelId}`);
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { channelId, content, attachments } = data;

        // Insert message into database
        const result = await db.query(
          `INSERT INTO messages (channel_id, user_id, content, attachments)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [channelId, socket.userId, content, JSON.stringify(attachments || [])]
        );

        const message = result.rows[0];

        // Get user info
        const userResult = await db.query(
          `SELECT username, display_name, avatar FROM users WHERE id = $1`,
          [socket.userId]
        );

        const fullMessage = {
          ...message,
          ...userResult.rows[0]
        };

        // Broadcast to all users in the channel
        io.to(`channel:${channelId}`).emit('message:new', fullMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (channelId) => {
      socket.to(`channel:${channelId}`).emit('typing:start', {
        channelId,
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing:stop', (channelId) => {
      socket.to(`channel:${channelId}`).emit('typing:stop', {
        channelId,
        userId: socket.userId
      });
    });

    // Voice channel events
    socket.on('voice:join', async (data) => {
      const { channelId } = data;

      try {
        // Record voice session
        await db.query(
          `INSERT INTO voice_sessions (user_id, channel_id) VALUES ($1, $2)`,
          [socket.userId, channelId]
        );

        socket.join(`voice:${channelId}`);

        // Notify others in voice channel
        socket.to(`voice:${channelId}`).emit('voice:user-joined', {
          userId: socket.userId,
          username: socket.username
        });

        // Get list of users already in voice
        const usersInVoice = Array.from(io.sockets.adapter.rooms.get(`voice:${channelId}`) || [])
          .filter(id => id !== socket.id)
          .map(id => {
            const s = io.sockets.sockets.get(id);
            return { userId: s.userId, username: s.username };
          });

        socket.emit('voice:users-list', usersInVoice);
      } catch (error) {
        console.error('Voice join error:', error);
      }
    });

    socket.on('voice:leave', async (data) => {
      const { channelId } = data;

      try {
        // Update voice session
        await db.query(
          `UPDATE voice_sessions 
           SET left_at = CURRENT_TIMESTAMP 
           WHERE user_id = $1 AND channel_id = $2 AND left_at IS NULL`,
          [socket.userId, channelId]
        );

        socket.leave(`voice:${channelId}`);

        socket.to(`voice:${channelId}`).emit('voice:user-left', {
          userId: socket.userId
        });
      } catch (error) {
        console.error('Voice leave error:', error);
      }
    });

    // WebRTC signaling
    socket.on('webrtc:offer', (data) => {
      const { targetUserId, offer } = data;
      const targetSocket = connectedUsers.get(targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('webrtc:offer', {
          fromUserId: socket.userId,
          offer
        });
      }
    });

    socket.on('webrtc:answer', (data) => {
      const { targetUserId, answer } = data;
      const targetSocket = connectedUsers.get(targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('webrtc:answer', {
          fromUserId: socket.userId,
          answer
        });
      }
    });

    socket.on('webrtc:ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      const targetSocket = connectedUsers.get(targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('webrtc:ice-candidate', {
          fromUserId: socket.userId,
          candidate
        });
      }
    });

    // Direct message
    socket.on('dm:send', async (data) => {
      try {
        const { receiverId, content } = data;

        const result = await db.query(
          `INSERT INTO direct_messages (sender_id, receiver_id, content)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [socket.userId, receiverId, content]
        );

        const dm = result.rows[0];

        // Send to receiver if online
        const receiverSocket = connectedUsers.get(receiverId);
        if (receiverSocket) {
          receiverSocket.emit('dm:new', {
            ...dm,
            senderUsername: socket.username
          });
        }

        // Confirm to sender
        socket.emit('dm:sent', dm);
      } catch (error) {
        console.error('DM send error:', error);
      }
    });

    // Update status
    socket.on('status:update', async (status) => {
      try {
        await db.query(
          'UPDATE users SET status = $1 WHERE id = $2',
          [status, socket.userId]
        );

        io.emit('user:status', {
          userId: socket.userId,
          status
        });
      } catch (error) {
        console.error('Status update error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.username}`);
      
      connectedUsers.delete(socket.userId);

      // Update user status to offline
      await db.query(
        'UPDATE users SET status = $1, last_seen_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['OFFLINE', socket.userId]
      );

      // Broadcast user offline status
      io.emit('user:status', {
        userId: socket.userId,
        status: 'OFFLINE'
      });
    });
  });
};
