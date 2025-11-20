const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'discord.db');
const db = new Database(dbPath);

console.log('✅ SQLite Database connected');

// Helper function to run async-style queries
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      
      if (isSelect) {
        const rows = db.prepare(sql).all(...params);
        resolve({ rows });
      } else {
        const info = db.prepare(sql).run(...params);
        resolve({ rows: [], rowCount: info.changes, insertId: info.lastInsertRowid });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  query,
  db,
  end: () => db.close()
};
