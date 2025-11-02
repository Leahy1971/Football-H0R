const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const Database = require('better-sqlite3');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Database initialization
const db = new Database('football.db');
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clubs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        club_name TEXT NOT NULL,
        location TEXT,
        level TEXT,
        description TEXT,
        staff_info TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        image_url TEXT,
        video_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        club_id INTEGER,
        listing_type TEXT NOT NULL,
        player_name TEXT NOT NULL,
        position TEXT,
        age INTEGER,
        experience TEXT,
        bio TEXT,
        availability TEXT,
        image_url TEXT,
        video_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        connected_user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (connected_user_id) REFERENCES users(id),
        UNIQUE(user_id, connected_user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        read_status INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        type TEXT,
        read_status INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'football-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, user_type, full_name } = req.body;
        
        if (!username || !email || !password || !user_type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const stmt = db.prepare('INSERT INTO users (username, email, password, user_type, full_name) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(username, email, hashedPassword, user_type, full_name || '');
        
        res.json({ success: true, userId: result.lastInsertRowid });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.userType = user.user_type;
        
        res.json({ 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                user_type: user.user_type,
                full_name: user.full_name 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// User Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, username, email, user_type, full_name FROM users WHERE id = ?').get(req.session.userId);
    res.json(user);
});

// Club Routes

// Create club
app.post('/api/clubs', requireAuth, upload.single('image'), (req, res) => {
    try {
        const { club_name, location, level, description, staff_info, contact_email, contact_phone, video_url } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const stmt = db.prepare(`
            INSERT INTO clubs (user_id, club_name, location, level, description, staff_info, contact_email, contact_phone, image_url, video_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(req.session.userId, club_name, location, level, description, staff_info, contact_email, contact_phone, image_url, video_url);
        
        res.json({ success: true, clubId: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create club' });
    }
});

// Get all clubs
app.get('/api/clubs', (req, res) => {
    const clubs = db.prepare(`
        SELECT c.*, u.username 
        FROM clubs c 
        JOIN users u ON c.user_id = u.id 
        ORDER BY c.created_at DESC
    `).all();
    res.json(clubs);
});

// Get club by ID
app.get('/api/clubs/:id', (req, res) => {
    const club = db.prepare(`
        SELECT c.*, u.username 
        FROM clubs c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
    `).get(req.params.id);
    
    if (club) {
        res.json(club);
    } else {
        res.status(404).json({ error: 'Club not found' });
    }
});

// Update club
app.put('/api/clubs/:id', requireAuth, upload.single('image'), (req, res) => {
    try {
        const { club_name, location, level, description, staff_info, contact_email, contact_phone, video_url } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
        
        const club = db.prepare('SELECT * FROM clubs WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
        
        if (!club) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        let updateQuery = `
            UPDATE clubs 
            SET club_name = ?, location = ?, level = ?, description = ?, staff_info = ?, 
                contact_email = ?, contact_phone = ?, video_url = ?
        `;
        let params = [club_name, location, level, description, staff_info, contact_email, contact_phone, video_url];
        
        if (image_url) {
            updateQuery += ', image_url = ?';
            params.push(image_url);
        }
        
        updateQuery += ' WHERE id = ?';
        params.push(req.params.id);
        
        db.prepare(updateQuery).run(...params);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update club' });
    }
});

// Player Routes

// Create player listing
app.post('/api/players', requireAuth, upload.single('image'), (req, res) => {
    try {
        const { listing_type, player_name, position, age, experience, bio, availability, club_id, video_url } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const stmt = db.prepare(`
            INSERT INTO players (user_id, club_id, listing_type, player_name, position, age, experience, bio, availability, image_url, video_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(req.session.userId, club_id || null, listing_type, player_name, position, age, experience, bio, availability, image_url, video_url);
        
        res.json({ success: true, playerId: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create player listing' });
    }
});

// Get all players (with optional filters)
app.get('/api/players', (req, res) => {
    const { listing_type, position, club_id } = req.query;
    
    let query = `
        SELECT p.*, u.username, c.club_name 
        FROM players p 
        JOIN users u ON p.user_id = u.id 
        LEFT JOIN clubs c ON p.club_id = c.id
        WHERE 1=1
    `;
    const params = [];
    
    if (listing_type) {
        query += ' AND p.listing_type = ?';
        params.push(listing_type);
    }
    
    if (position) {
        query += ' AND p.position = ?';
        params.push(position);
    }
    
    if (club_id) {
        query += ' AND p.club_id = ?';
        params.push(club_id);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const players = db.prepare(query).all(...params);
    res.json(players);
});

// Get player by ID
app.get('/api/players/:id', (req, res) => {
    const player = db.prepare(`
        SELECT p.*, u.username, c.club_name 
        FROM players p 
        JOIN users u ON p.user_id = u.id 
        LEFT JOIN clubs c ON p.club_id = c.id 
        WHERE p.id = ?
    `).get(req.params.id);
    
    if (player) {
        res.json(player);
    } else {
        res.status(404).json({ error: 'Player not found' });
    }
});

// Update player listing
app.put('/api/players/:id', requireAuth, upload.single('image'), (req, res) => {
    try {
        const { listing_type, player_name, position, age, experience, bio, availability, club_id, video_url } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
        
        const player = db.prepare('SELECT * FROM players WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
        
        if (!player) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        let updateQuery = `
            UPDATE players 
            SET listing_type = ?, player_name = ?, position = ?, age = ?, experience = ?, 
                bio = ?, availability = ?, club_id = ?, video_url = ?
        `;
        let params = [listing_type, player_name, position, age, experience, bio, availability, club_id || null, video_url];
        
        if (image_url) {
            updateQuery += ', image_url = ?';
            params.push(image_url);
        }
        
        updateQuery += ' WHERE id = ?';
        params.push(req.params.id);
        
        db.prepare(updateQuery).run(...params);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update player listing' });
    }
});

// Connection Routes

// Send connection request
app.post('/api/connections', requireAuth, (req, res) => {
    try {
        const { connected_user_id } = req.body;
        
        if (req.session.userId === parseInt(connected_user_id, 10)) {
            return res.status(400).json({ error: 'Cannot connect to yourself' });
        }
        
        const stmt = db.prepare('INSERT INTO connections (user_id, connected_user_id, status) VALUES (?, ?, ?)');
        const result = stmt.run(req.session.userId, connected_user_id, 'pending');
        
        // Create notification for the other user
        const notifStmt = db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)');
        const user = db.prepare('SELECT username FROM users WHERE id = ?').get(req.session.userId);
        notifStmt.run(connected_user_id, `${user.username} wants to connect with you`, 'connection_request');
        
        res.json({ success: true, connectionId: result.lastInsertRowid });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Connection already exists' });
        } else {
            res.status(500).json({ error: 'Failed to send connection request' });
        }
    }
});

// Accept/Reject connection
app.put('/api/connections/:id', requireAuth, (req, res) => {
    try {
        const { status } = req.body;
        
        const connection = db.prepare('SELECT * FROM connections WHERE id = ? AND connected_user_id = ?').get(req.params.id, req.session.userId);
        
        if (!connection) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        db.prepare('UPDATE connections SET status = ? WHERE id = ?').run(status, req.params.id);
        
        if (status === 'accepted') {
            // Create reciprocal connection
            try {
                db.prepare('INSERT INTO connections (user_id, connected_user_id, status) VALUES (?, ?, ?)').run(req.session.userId, connection.user_id, 'accepted');
            } catch (err) {
                // Might already exist
            }
            
            // Create notification
            const notifStmt = db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)');
            const user = db.prepare('SELECT username FROM users WHERE id = ?').get(req.session.userId);
            notifStmt.run(connection.user_id, `${user.username} accepted your connection request`, 'connection_accepted');
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update connection' });
    }
});

// Get user connections
app.get('/api/connections', requireAuth, (req, res) => {
    const connections = db.prepare(`
        SELECT c.*, u.username, u.full_name 
        FROM connections c 
        JOIN users u ON (c.connected_user_id = u.id OR c.user_id = u.id)
        WHERE (c.user_id = ? OR c.connected_user_id = ?) AND c.status = 'accepted' AND u.id != ?
        GROUP BY u.id
    `).all(req.session.userId, req.session.userId, req.session.userId);
    res.json(connections);
});

// Get pending connection requests
app.get('/api/connections/pending', requireAuth, (req, res) => {
    const requests = db.prepare(`
        SELECT c.*, u.username, u.full_name 
        FROM connections c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.connected_user_id = ? AND c.status = 'pending'
    `).all(req.session.userId);
    res.json(requests);
});

// Message Routes

// Send message
app.post('/api/messages', requireAuth, (req, res) => {
    try {
        const { receiver_id, message } = req.body;
        
        // Validate message
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }
        if (message.length > 5000) {
            return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
        }
        
        // Check if users are connected
        const connection = db.prepare(`
            SELECT * FROM connections 
            WHERE ((user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?))
            AND status = 'accepted'
        `).get(req.session.userId, receiver_id, receiver_id, req.session.userId);
        
        if (!connection) {
            return res.status(403).json({ error: 'Users must be connected to send messages' });
        }
        
        const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)');
        const result = stmt.run(req.session.userId, receiver_id, message.trim());
        
        // Create notification
        const notifStmt = db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)');
        const user = db.prepare('SELECT username FROM users WHERE id = ?').get(req.session.userId);
        notifStmt.run(receiver_id, `New message from ${user.username}`, 'message');
        
        res.json({ success: true, messageId: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get messages with a user
app.get('/api/messages/:userId', requireAuth, (req, res) => {
    const messages = db.prepare(`
        SELECT m.*, u.username as sender_username 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
    `).all(req.session.userId, req.params.userId, req.params.userId, req.session.userId);
    
    // Mark messages as read
    db.prepare('UPDATE messages SET read_status = 1 WHERE receiver_id = ? AND sender_id = ?').run(req.session.userId, req.params.userId);
    
    res.json(messages);
});

// Get unread message count
app.get('/api/messages/unread/count', requireAuth, (req, res) => {
    const result = db.prepare('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read_status = 0').get(req.session.userId);
    res.json({ count: result.count });
});

// Notification Routes

// Get user notifications
app.get('/api/notifications', requireAuth, (req, res) => {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.session.userId);
    res.json(notifications);
});

// Mark notification as read
app.put('/api/notifications/:id', requireAuth, (req, res) => {
    db.prepare('UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.session.userId);
    res.json({ success: true });
});

// Mark all notifications as read
app.put('/api/notifications/read/all', requireAuth, (req, res) => {
    db.prepare('UPDATE notifications SET read_status = 1 WHERE user_id = ?').run(req.session.userId);
    res.json({ success: true });
});

// Get unread notification count
app.get('/api/notifications/unread/count', requireAuth, (req, res) => {
    const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0').get(req.session.userId);
    res.json({ count: result.count });
});

// Search
app.get('/api/search', (req, res) => {
    const { q, type } = req.query;
    
    if (!q) {
        return res.json([]);
    }
    
    const searchTerm = `%${q}%`;
    let results = [];
    
    if (!type || type === 'clubs') {
        const clubs = db.prepare(`
            SELECT 'club' as type, c.id, c.club_name as name, c.location, c.level, c.image_url 
            FROM clubs c 
            WHERE c.club_name LIKE ? OR c.location LIKE ? OR c.level LIKE ?
            LIMIT 10
        `).all(searchTerm, searchTerm, searchTerm);
        results = results.concat(clubs);
    }
    
    if (!type || type === 'players') {
        const players = db.prepare(`
            SELECT 'player' as type, p.id, p.player_name as name, p.position, p.listing_type, p.image_url 
            FROM players p 
            WHERE p.player_name LIKE ? OR p.position LIKE ?
            LIMIT 10
        `).all(searchTerm, searchTerm);
        results = results.concat(players);
    }
    
    res.json(results);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
