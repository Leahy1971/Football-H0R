// Home page functionality
document.addEventListener('DOMContentLoaded', async () => {
    loadRecentPlayers();
    loadRecentClubs();
    setupSearch();
});

// Load recent player listings
async function loadRecentPlayers() {
    try {
        const response = await fetch('/api/players');
        const players = await response.json();
        
        const container = document.getElementById('recentPlayers');
        if (!container) return;
        
        const recentPlayers = players.slice(0, 6);
        
        if (recentPlayers.length === 0) {
            container.innerHTML = '<p class="text-center">No player listings yet.</p>';
            return;
        }
        
        container.innerHTML = recentPlayers.map(player => `
            <div class="card" onclick="window.location.href='/player-detail.html?id=${player.id}'">
                ${player.image_url ? `<img src="${player.image_url}" alt="${player.player_name}" class="card-image">` : ''}
                <h3 class="card-title">${player.player_name}</h3>
                <div class="card-meta">${player.position || 'N/A'} • ${player.age ? player.age + ' years' : 'Age N/A'}</div>
                <p class="card-description">${player.bio ? player.bio.substring(0, 100) + '...' : 'No description'}</p>
                <div class="card-tags">
                    <span class="tag ${player.listing_type === 'available' ? 'tag-success' : 'tag-primary'}">
                        ${player.listing_type === 'available' ? 'Available' : 'Required'}
                    </span>
                    ${player.club_name ? `<span class="tag">${player.club_name}</span>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load players:', error);
    }
}

// Load recent clubs
async function loadRecentClubs() {
    try {
        const response = await fetch('/api/clubs');
        const clubs = await response.json();
        
        const container = document.getElementById('recentClubs');
        if (!container) return;
        
        const recentClubs = clubs.slice(0, 6);
        
        if (recentClubs.length === 0) {
            container.innerHTML = '<p class="text-center">No clubs listed yet.</p>';
            return;
        }
        
        container.innerHTML = recentClubs.map(club => `
            <div class="card" onclick="window.location.href='/club-detail.html?id=${club.id}'">
                ${club.image_url ? `<img src="${club.image_url}" alt="${club.club_name}" class="card-image">` : ''}
                <h3 class="card-title">${club.club_name}</h3>
                <div class="card-meta">${club.location || 'Location N/A'}</div>
                <p class="card-description">${club.description ? club.description.substring(0, 100) + '...' : 'No description'}</p>
                <div class="card-tags">
                    ${club.level ? `<span class="tag tag-primary">${club.level}</span>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load clubs:', error);
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('quickSearch');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchBtn) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
    });
    
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

// Perform search
async function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    if (!query || query.trim().length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="text-center">No results found.</p>';
            return;
        }
        
        searchResults.innerHTML = results.map(result => {
            if (result.type === 'club') {
                return `
                    <div class="card" onclick="window.location.href='/club-detail.html?id=${result.id}'">
                        ${result.image_url ? `<img src="${result.image_url}" alt="${result.name}" class="card-image">` : ''}
                        <h3 class="card-title">${result.name}</h3>
                        <div class="card-meta">Club • ${result.location || 'N/A'}</div>
                        <div class="card-tags">
                            ${result.level ? `<span class="tag tag-primary">${result.level}</span>` : ''}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="card" onclick="window.location.href='/player-detail.html?id=${result.id}'">
                        ${result.image_url ? `<img src="${result.image_url}" alt="${result.name}" class="card-image">` : ''}
                        <h3 class="card-title">${result.name}</h3>
                        <div class="card-meta">Player • ${result.position || 'N/A'}</div>
                        <div class="card-tags">
                            <span class="tag ${result.listing_type === 'available' ? 'tag-success' : 'tag-primary'}">
                                ${result.listing_type === 'available' ? 'Available' : 'Required'}
                            </span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    } catch (error) {
        console.error('Search failed:', error);
        searchResults.innerHTML = '<p class="text-center error-message">Search failed. Please try again.</p>';
    }
}
