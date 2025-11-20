const express = require('express');
const db = require('../database');

const router = express.Router();

// Create channel
router.post('/', async (req, res) => {
  try {
    const { server_id, name, type, category_id } = req.body;

    if (!server_id || !name) {
      return res.status(400).json({ error: 'Server ID and name are required' });
    }

    // Check if user is member of server
    const memberCheck = await db.query(
      `SELECT * FROM server_members WHERE user_id = $1 AND server_id = $2`,
      [req.user.id, server_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this server' });
    }

    const result = await db.query(
      `INSERT INTO channels (server_id, name, type, category_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [server_id, name, type || 'TEXT', category_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get channel by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.* FROM channels c
       INNER JOIN server_members sm ON c.server_id = sm.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete channel
router.delete('/:id', async (req, res) => {
  try {
    const channelResult = await db.query(
      `SELECT c.*, s.owner_id FROM channels c
       INNER JOIN servers s ON c.server_id = s.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = channelResult.rows[0];

    if (channel.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this channel' });
    }

    await db.query(`DELETE FROM channels WHERE id = $1`, [req.params.id]);

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
