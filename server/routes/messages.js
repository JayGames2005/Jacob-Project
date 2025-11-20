const express = require('express');
const db = require('../database');

const router = express.Router();

// Get messages for a channel
router.get('/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // Message ID for pagination

    // Check if user has access to channel
    const channelCheck = await db.query(
      `SELECT c.* FROM channels c
       INNER JOIN server_members sm ON c.server_id = sm.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, req.user.id]
    );

    if (channelCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = `
      SELECT m.*, u.username, u.display_name, u.avatar
      FROM messages m
      INNER JOIN users u ON m.user_id = u.id
      WHERE m.channel_id = $1
    `;
    const params = [channelId];

    if (before) {
      query += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $2)`;
      params.push(before);
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message (via REST, but usually done via WebSocket)
router.post('/', async (req, res) => {
  try {
    const { channel_id, content, attachments } = req.body;

    if (!channel_id || !content) {
      return res.status(400).json({ error: 'Channel ID and content are required' });
    }

    // Check if user has access
    const channelCheck = await db.query(
      `SELECT c.* FROM channels c
       INNER JOIN server_members sm ON c.server_id = sm.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channel_id, req.user.id]
    );

    if (channelCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `INSERT INTO messages (channel_id, user_id, content, attachments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [channel_id, req.user.id, content, JSON.stringify(attachments || [])]
    );

    const message = result.rows[0];

    // Get user info
    const userResult = await db.query(
      `SELECT username, display_name, avatar FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.status(201).json({ ...message, ...userResult.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    const messageResult = await db.query(
      `SELECT * FROM messages WHERE id = $1`,
      [req.params.id]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messageResult.rows[0];

    if (message.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await db.query(`DELETE FROM messages WHERE id = $1`, [req.params.id]);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
