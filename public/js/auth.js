// Authentication utilities
let currentUser = null;

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            currentUser = await response.json();
            updateNav(true);
            updateNotificationCount();
            updateMessageCount();
            return true;
        } else {
            currentUser = null;
            updateNav(false);
            return false;
        }
    } catch (error) {
        currentUser = null;
        updateNav(false);
        return false;
    }
}

// Update navigation based on auth status
function updateNav(isAuthenticated) {
    const navUser = document.getElementById('navUser');
    const navAuth = document.getElementById('navAuth');
    const navUsername = document.getElementById('navUsername');
    
    if (isAuthenticated && currentUser) {
        if (navUser) navUser.style.display = 'flex';
        if (navAuth) navAuth.style.display = 'none';
        if (navUsername) navUsername.textContent = currentUser.username;
    } else {
        if (navUser) navUser.style.display = 'none';
        if (navAuth) navAuth.style.display = 'flex';
    }
}

// Update notification count
async function updateNotificationCount() {
    if (!currentUser) return;
    
    try {
        const response = await fetch('/api/notifications/unread/count');
        const data = await response.json();
        const badge = document.getElementById('notificationsBadge');
        
        if (badge) {
            if (data.count > 0) {
                badge.textContent = data.count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Failed to update notification count:', error);
    }
}

// Update message count
async function updateMessageCount() {
    if (!currentUser) return;
    
    try {
        const response = await fetch('/api/messages/unread/count');
        const data = await response.json();
        const badge = document.getElementById('messagesBadge');
        
        if (badge) {
            if (data.count > 0) {
                badge.textContent = data.count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Failed to update message count:', error);
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        currentUser = null;
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Update counts periodically
    if (currentUser) {
        setInterval(() => {
            updateNotificationCount();
            updateMessageCount();
        }, 30000); // Every 30 seconds
    }
});

// Utility functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'error-message';
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'success-message';
    }
}

function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

function extractYouTubeId(url) {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
        // Validate that videoId contains only valid characters (alphanumeric, -, _)
        const videoId = match[2];
        if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return videoId;
        }
    }
    
    return null;
}

function createYouTubeEmbed(url) {
    const videoId = extractYouTubeId(url);
    if (!videoId) return '';
    
    return `
        <div class="video-container">
            <iframe 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    `;
}
