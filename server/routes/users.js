const express = require('express');
const db = require('../database');

const router = express.Router();

// Get current user
router.get('/me', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, username, display_name, avatar, banner, bio, status, custom_status, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.patch('/me', async (req, res) => {
  try {
    const { display_name, bio, custom_status } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           custom_status = COALESCE($3, custom_status)
       WHERE id = $4
       RETURNING id, email, username, display_name, avatar, banner, bio, status, custom_status`,
      [display_name, bio, custom_status, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user status
router.patch('/me/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ONLINE', 'IDLE', 'DND', 'OFFLINE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query(
      'UPDATE users SET status = $1 WHERE id = $2',
      [status, req.user.id]
    );

    res.json({ message: 'Status updated', status });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, display_name, avatar, banner, bio, status, custom_status 
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
