# Football-H0R
Football Player and Club Connector - A fully functioning classified ads style website for football clubs and players

## 🎯 Features

### Core Functionality
- **User Accounts**: Complete authentication system with registration and login
- **User Types**: Players, Club Representatives, Agents, and Scouts
- **Club Listings**: Create and manage football club profiles
- **Player Listings**: List available players or required positions
- **Search & Discovery**: Find clubs and players with advanced filtering
- **Connections System**: Users must connect before they can chat
- **Messaging**: Real-time messaging between connected users
- **Notifications**: Stay updated with connection requests and messages
- **Media Support**: Upload images and embed YouTube videos
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- Zero-budget solution using open-source technologies
- Node.js + Express backend
- SQLite database (no external database required)
- Vanilla JavaScript frontend (no framework dependencies)
- Session-based authentication
- File upload support
- RESTful API architecture

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Leahy1971/Football-H0R.git
cd Football-H0R
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Default Port
The application runs on port 3000 by default. You can change this by setting the PORT environment variable:
```bash
PORT=8080 npm start
```

### Populate Club Directory
To populate the database with a directory of English non-league clubs (National League, NLS, NLN, Isthmian leagues):
```bash
npm run populate-clubs
```

This will add 170+ clubs from various English leagues to the database.

## 📖 Usage Guide

### Getting Started

1. **Register an Account**
   - Visit the homepage and click "Register"
   - Fill in your details (username, email, password)
   - Select your user type (Player, Club, Agent, etc.)
   - Click "Register"

2. **Create Your Profile**
   - After logging in, go to your Dashboard
   - Add a Club listing if you represent a club
   - Add Player listings for available or required players

3. **Connect with Others**
   - Browse clubs and players
   - Click on listings to view details
   - Click "Connect to Chat" to send a connection request
   - Wait for the other user to accept

4. **Start Messaging**
   - Once connected, go to the Messages page
   - Select a conversation and start chatting
   - Receive notifications for new messages

### Adding a Club

1. Click "Add Club" from the dashboard or navigation
2. Fill in club details:
   - Club name (required)
   - Location
   - Level (Professional, Semi-Pro, Amateur, etc.)
   - Description
   - Staff information
   - Contact details
   - Upload club image
   - Add YouTube video link
3. Click "Add Club"

### Adding a Player Listing

1. Click "Add Player" from the dashboard or navigation
2. Select listing type:
   - **Available**: Player looking for a club
   - **Required**: Club looking for a player
3. Fill in player details:
   - Name, position, age
   - Experience level
   - Bio/description
   - Availability
   - Upload photo
   - Add YouTube video link
4. Click "Add Player Listing"

### Managing Connections

1. View connection requests on the Dashboard or Notifications page
2. Accept or reject connection requests
3. Connected users can message each other
4. Manage your connections from the Connections page

## 📁 Project Structure

```
Football-H0R/
├── server.js              # Main server file with all API routes
├── package.json           # Dependencies and scripts
├── football.db           # SQLite database (auto-created)
├── uploads/              # User uploaded images (auto-created)
├── public/               # Frontend files
│   ├── index.html        # Homepage
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── clubs.html        # Browse clubs
│   ├── players.html      # Browse players
│   ├── dashboard.html    # User dashboard
│   ├── messages.html     # Messaging interface
│   ├── notifications.html # Notifications
│   ├── connections.html  # Manage connections
│   ├── add-club.html     # Add club form
│   ├── add-player.html   # Add player form
│   ├── club-detail.html  # Club details page
│   ├── player-detail.html # Player details page
│   ├── css/
│   │   └── style.css     # All styles
│   └── js/
│       ├── auth.js       # Authentication utilities
│       └── app.js        # Homepage functionality
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Clubs
- `GET /api/clubs` - List all clubs
- `GET /api/clubs/:id` - Get club by ID
- `POST /api/clubs` - Create new club (auth required)
- `PUT /api/clubs/:id` - Update club (auth required)

### Players
- `GET /api/players` - List all players (supports filters)
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create player listing (auth required)
- `PUT /api/players/:id` - Update player listing (auth required)

### Connections
- `GET /api/connections` - Get user connections (auth required)
- `GET /api/connections/pending` - Get pending requests (auth required)
- `POST /api/connections` - Send connection request (auth required)
- `PUT /api/connections/:id` - Accept/reject connection (auth required)

### Messages
- `GET /api/messages/:userId` - Get messages with user (auth required)
- `POST /api/messages` - Send message (auth required)
- `GET /api/messages/unread/count` - Get unread count (auth required)

### Notifications
- `GET /api/notifications` - Get user notifications (auth required)
- `PUT /api/notifications/:id` - Mark as read (auth required)
- `PUT /api/notifications/read/all` - Mark all as read (auth required)
- `GET /api/notifications/unread/count` - Get unread count (auth required)

### Search
- `GET /api/search?q=query` - Search clubs and players

## 🎨 Customization

### Styling
All styles are in `public/css/style.css`. The design uses CSS custom properties (variables) for easy theming:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --success-color: #16a34a;
    /* ... more variables */
}
```

### Adding Features
The codebase is designed to be extensible:
- Add new API routes in `server.js`
- Create new pages in the `public/` directory
- Extend the database schema in the database initialization section

## 🔐 Security

- Passwords are hashed using bcrypt
- Session-based authentication
- SQL injection prevention through prepared statements
- File upload restrictions (5MB limit, image files only with MIME type validation)
- Input validation for messages and user data
- YouTube video ID validation to prevent XSS

### Production Recommendations
For production deployment, consider adding:
- Rate limiting (e.g., using express-rate-limit)
- CSRF protection (e.g., using csurf middleware)
- HTTPS/SSL for secure cookie transmission
- Environment variables for sensitive configuration
- Additional input sanitization
- Database backups and replication

## 🐛 Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be v14+)

### Database errors
- Delete `football.db` and restart the server to recreate the database
- Check file permissions in the project directory

### Image uploads not working
- Ensure the `uploads/` directory exists and has write permissions
- Check file size (max 5MB)
- Verify file format (images only)

### Connection/messaging issues
- Users must be connected before they can message
- Check browser console for error messages
- Ensure you're logged in

## 📝 Database Schema

The application uses SQLite with the following tables:
- **users**: User accounts and authentication
- **clubs**: Football club profiles
- **players**: Player listings (available/required)
- **connections**: User connections for messaging
- **messages**: Chat messages between users
- **notifications**: System notifications

## 🌟 Future Enhancements

Possible features to add:
- Email notifications
- Advanced search filters
- User ratings/reviews
- Match scheduling
- Payment integration
- Mobile app
- Real-time chat with WebSockets
- Video calls
- Document sharing

## 📄 License

ISC License

## 🤝 Contributing

This is a zero-budget project built for rapid deployment. Contributions are welcome!

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for the football community

