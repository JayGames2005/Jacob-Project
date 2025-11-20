const express = require('express');
const db = require('../database');

const router = express.Router();

// Create server
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Server name is required' });
    }

    const result = await db.query(
      `INSERT INTO servers (name, description, owner_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, req.user.id]
    );

    const server = result.rows[0];

    // Add owner as member
    await db.query(
      `INSERT INTO server_members (user_id, server_id) VALUES ($1, $2)`,
      [req.user.id, server.id]
    );

    // Create default channels
    await db.query(
      `INSERT INTO channels (server_id, name, type, position) VALUES 
       ($1, 'general', 'TEXT', 0),
       ($1, 'General Voice', 'VOICE', 1)`,
      [server.id]
    );

    res.status(201).json(server);
  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's servers
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.* FROM servers s
       INNER JOIN server_members sm ON s.id = sm.server_id
       WHERE sm.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get server by ID
router.get('/:id', async (req, res) => {
  try {
    const serverResult = await db.query(
      `SELECT s.* FROM servers s
       INNER JOIN server_members sm ON s.id = sm.server_id
       WHERE s.id = $1 AND sm.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (serverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Server not found or access denied' });
    }

    const server = serverResult.rows[0];

    // Get channels
    const channelsResult = await db.query(
      `SELECT * FROM channels WHERE server_id = $1 ORDER BY position ASC`,
      [req.params.id]
    );

    // Get members
    const membersResult = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar, u.status, sm.nickname
       FROM users u
       INNER JOIN server_members sm ON u.id = sm.user_id
       WHERE sm.server_id = $1`,
      [req.params.id]
    );

    server.channels = channelsResult.rows;
    server.members = membersResult.rows;

    res.json(server);
  } catch (error) {
    console.error('Get server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join server with invite code
router.post('/join/:inviteCode', async (req, res) => {
  try {
    const serverResult = await db.query(
      `SELECT * FROM servers WHERE invite_code = $1`,
      [req.params.inviteCode]
    );

    if (serverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    const server = serverResult.rows[0];

    // Check if already a member
    const memberCheck = await db.query(
      `SELECT * FROM server_members WHERE user_id = $1 AND server_id = $2`,
      [req.user.id, server.id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member of this server' });
    }

    // Add as member
    await db.query(
      `INSERT INTO server_members (user_id, server_id) VALUES ($1, $2)`,
      [req.user.id, server.id]
    );

    res.json({ message: 'Joined server successfully', server });
  } catch (error) {
    console.error('Join server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete server
router.delete('/:id', async (req, res) => {
  try {
    const serverResult = await db.query(
      `SELECT * FROM servers WHERE id = $1 AND owner_id = $2`,
      [req.params.id, req.user.id]
    );

    if (serverResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this server' });
    }

    await db.query(`DELETE FROM servers WHERE id = $1`, [req.params.id]);

    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
