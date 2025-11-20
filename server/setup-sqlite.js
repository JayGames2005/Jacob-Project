const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'discord.db');

// Delete existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  Removed existing database');
}

const db = new Database(dbPath);

console.log('🔧 Setting up SQLite database...');

// SQLite schema
const schema = `
-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    password TEXT NOT NULL,
    avatar TEXT,
    banner TEXT,
    bio TEXT,
    status TEXT DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'IDLE', 'DND', 'OFFLINE')),
    custom_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME
);

-- Servers Table
CREATE TABLE servers (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    banner TEXT,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE DEFAULT (hex(randomblob(5))),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Server Members Table
CREATE TABLE server_members (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    nickname TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, server_id)
);

-- Roles Table
CREATE TABLE roles (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    permissions TEXT DEFAULT '{}',
    position INTEGER DEFAULT 0,
    mentionable INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Member Roles Junction Table
CREATE TABLE member_roles (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    member_id TEXT NOT NULL REFERENCES server_members(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(member_id, role_id)
);

-- Channels Table
CREATE TABLE channels (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'VOICE', 'VIDEO')),
    topic TEXT,
    position INTEGER DEFAULT 0,
    category_id TEXT REFERENCES channels(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'DEFAULT' CHECK (type IN ('DEFAULT', 'SYSTEM', 'REPLY')),
    attachments TEXT,
    embeds TEXT,
    mentions TEXT,
    reply_to_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
    is_pinned INTEGER DEFAULT 0,
    is_edited INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reactions Table
CREATE TABLE reactions (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id, emoji)
);

-- Direct Messages Table
CREATE TABLE direct_messages (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Friend Requests Table
CREATE TABLE friend_requests (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

-- Invites Table
CREATE TABLE invites (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    code TEXT UNIQUE DEFAULT (hex(randomblob(5))),
    max_uses INTEGER,
    uses INTEGER DEFAULT 0,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Voice Sessions Table
CREATE TABLE voice_sessions (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME,
    is_muted INTEGER DEFAULT 0,
    is_deafened INTEGER DEFAULT 0
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_servers_owner ON servers(owner_id);
CREATE INDEX idx_servers_invite ON servers(invite_code);
CREATE INDEX idx_server_members_user ON server_members(user_id);
CREATE INDEX idx_server_members_server ON server_members(server_id);
CREATE INDEX idx_channels_server ON channels(server_id);
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);
`;

try {
  db.exec(schema);
  
  console.log('\n✅ SQLite database setup complete!');
  console.log('📋 Database file: discord.db');
  console.log('\n📋 Tables created:');
  console.log('   - users');
  console.log('   - servers');
  console.log('   - server_members');
  console.log('   - roles');
  console.log('   - member_roles');
  console.log('   - channels');
  console.log('   - messages');
  console.log('   - reactions');
  console.log('   - direct_messages');
  console.log('   - friend_requests');
  console.log('   - invites');
  console.log('   - voice_sessions');
  console.log('   - audit_logs');
  console.log('\n🚀 Ready to start! Run: npm run start:sqlite');
  
  db.close();
  process.exit(0);
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  db.close();
  process.exit(1);
}
