const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

// Connect to database
const db = new Database('football.db');

// Create a system user for the club directory
async function createSystemUser() {
    const hashedPassword = await bcrypt.hash('ClubDirectory2024!', 10);
    
    try {
        const stmt = db.prepare('INSERT INTO users (username, email, password, user_type, full_name) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run('clubdirectory', 'directory@footballconnect.com', hashedPassword, 'club', 'Club Directory');
        return result.lastInsertRowid;
    } catch (error) {
        // User might already exist, get their ID
        const user = db.prepare('SELECT id FROM users WHERE username = ?').get('clubdirectory');
        return user ? user.id : null;
    }
}

// Club data from the list
const clubs = [
    { name: 'AFC Fylde', league: 'National League' },
    { name: 'Aldershot Town', league: 'National League' },
    { name: 'Altrincham', league: 'National League' },
    { name: 'Barnet', league: 'National League' },
    { name: 'Boreham Wood', league: 'National League' },
    { name: 'Boston United', league: 'National League' },
    { name: 'Bromley', league: 'National League' },
    { name: 'Chesterfield', league: 'National League' },
    { name: 'Dagenham & Redbridge', league: 'National League' },
    { name: 'Eastleigh', league: 'National League' },
    { name: 'Ebbsfleet United', league: 'National League' },
    { name: 'FC Halifax Town', league: 'National League' },
    { name: 'Gateshead', league: 'National League' },
    { name: 'Hartlepool United', league: 'National League' },
    { name: 'Kidderminster Harriers', league: 'National League' },
    { name: 'Maidenhead United', league: 'National League' },
    { name: 'Oldham Athletic', league: 'National League' },
    { name: 'Oxford City', league: 'National League' },
    { name: 'Rochdale', league: 'National League' },
    { name: 'Solihull Moors', league: 'National League' },
    { name: 'Southend United', league: 'National League' },
    { name: 'Wealdstone', league: 'National League' },
    { name: 'Woking', league: 'National League' },
    { name: 'York City', league: 'National League' },
    { name: 'AFC Totton', league: 'NLS' },
    { name: 'Bath City', league: 'NLS' },
    { name: 'Chelmsford City', league: 'NLS' },
    { name: 'Chesham United', league: 'NLS' },
    { name: 'Chippenham Town', league: 'NLS' },
    { name: 'Dorking Wanderers', league: 'NLS' },
    { name: 'Dover Athletic', league: 'NLS' },
    { name: 'Eastbourne Borough', league: 'NLS' },
    { name: 'Enfield Town', league: 'NLS' },
    { name: 'Farnborough', league: 'NLS' },
    { name: 'Hampton & Richmond Borough', league: 'NLS' },
    { name: 'Hemel Hempstead Town', league: 'NLS' },
    { name: 'Hornchurch', league: 'NLS' },
    { name: 'Horsham', league: 'NLS' },
    { name: 'Maidstone United', league: 'NLS' },
    { name: 'Salisbury', league: 'NLS' },
    { name: 'Slough Town', league: 'NLS' },
    { name: 'Tonbridge Angels', league: 'NLS' },
    { name: 'Torquay United', league: 'NLS' },
    { name: 'Weston-super-Mare', league: 'NLS' },
    { name: 'Worthing', league: 'NLS' },
    { name: 'AFC Telford United', league: 'NLN' },
    { name: 'Alfreton Town', league: 'NLN' },
    { name: 'Blyth Spartans', league: 'NLN' },
    { name: 'Braintree Town', league: 'NLN' },
    { name: 'Buxton', league: 'NLN' },
    { name: 'Chester', league: 'NLN' },
    { name: 'Chorley', league: 'NLN' },
    { name: 'Curzon Ashton', league: 'NLN' },
    { name: 'Darlington', league: 'NLN' },
    { name: 'Farsley Celtic', league: 'NLN' },
    { name: 'Gloucester City', league: 'NLN' },
    { name: 'Hereford', league: 'NLN' },
    { name: "King's Lynn Town", league: 'NLN' },
    { name: 'Leamington', league: 'NLN' },
    { name: 'Peterborough Sports', league: 'NLN' },
    { name: 'Rushall Olympic', league: 'NLN' },
    { name: 'Scarborough Athletic', league: 'NLN' },
    { name: 'Scunthorpe United', league: 'NLN' },
    { name: 'South Shields', league: 'NLN' },
    { name: 'Spennymoor Town', league: 'NLN' },
    { name: 'Tamworth', league: 'NLN' },
    { name: 'Warrington Town', league: 'NLN' },
    { name: 'Whitby Town', league: 'NLN' },
    { name: 'Worcester City', league: 'NLN' },
    { name: 'Aveley', league: 'Isthmian Premier' },
    { name: 'Billericay Town', league: 'Isthmian Premier' },
    { name: 'Brentwood Town', league: 'Isthmian Premier' },
    { name: 'Burgess Hill Town', league: 'Isthmian Premier' },
    { name: 'Canvey Island', league: 'Isthmian Premier' },
    { name: 'Carshalton Athletic', league: 'Isthmian Premier' },
    { name: 'Chatham Town', league: 'Isthmian Premier' },
    { name: 'Cheshunt', league: 'Isthmian Premier' },
    { name: 'Chichester City', league: 'Isthmian Premier' },
    { name: 'Cray Valley (PM)', league: 'Isthmian Premier' },
    { name: 'Cray Wanderers', league: 'Isthmian Premier' },
    { name: 'Dartford', league: 'Isthmian Premier' },
    { name: 'Dulwich Hamlet', league: 'Isthmian Premier' },
    { name: 'Folkestone Invicta', league: 'Isthmian Premier' },
    { name: 'Hashtag United', league: 'Isthmian Premier' },
    { name: 'Lewes', league: 'Isthmian Premier' },
    { name: 'Potters Bar Town', league: 'Isthmian Premier' },
    { name: 'Ramsgate', league: 'Isthmian Premier' },
    { name: 'St Albans City', league: 'Isthmian Premier' },
    { name: 'Welling United', league: 'Isthmian Premier' },
    { name: 'Whitehawk', league: 'Isthmian Premier' },
    { name: 'Wingate & Finchley', league: 'Isthmian Premier' },
    { name: 'AFC Croydon Athletic', league: 'Isthmian SE' },
    { name: 'AFC Whyteleafe', league: 'Isthmian SE' },
    { name: 'Ashford United', league: 'Isthmian SE' },
    { name: 'Beckenham Town', league: 'Isthmian SE' },
    { name: 'Broadbridge Heath', league: 'Isthmian SE' },
    { name: 'Corinthian', league: 'Isthmian SE' },
    { name: 'East Grinstead Town', league: 'Isthmian SE' },
    { name: 'Erith & Belvedere', league: 'Isthmian SE' },
    { name: 'Faversham Town', league: 'Isthmian SE' },
    { name: 'Hastings United', league: 'Isthmian SE' },
    { name: 'Herne Bay', league: 'Isthmian SE' },
    { name: 'Lancing', league: 'Isthmian SE' },
    { name: 'Littlehampton Town', league: 'Isthmian SE' },
    { name: 'Merstham', league: 'Isthmian SE' },
    { name: 'Phoenix Sports', league: 'Isthmian SE' },
    { name: 'Sevenoaks Town', league: 'Isthmian SE' },
    { name: 'Sittingbourne', league: 'Isthmian SE' },
    { name: 'Three Bridges', league: 'Isthmian SE' },
    { name: 'VCD Athletic', league: 'Isthmian SE' },
    { name: 'Ascot United', league: 'Isthmian SC' },
    { name: 'Badshot Lea', league: 'Isthmian SC' },
    { name: 'Bedfont Sports', league: 'Isthmian SC' },
    { name: 'Binfield', league: 'Isthmian SC' },
    { name: 'Chipstead', league: 'Isthmian SC' },
    { name: 'Hanworth Villa', league: 'Isthmian SC' },
    { name: 'Hartley Wintney', league: 'Isthmian SC' },
    { name: 'Leatherhead', league: 'Isthmian SC' },
    { name: 'Marlow', league: 'Isthmian SC' },
    { name: 'Met Police', league: 'Isthmian SC' },
    { name: 'Northwood', league: 'Isthmian SC' },
    { name: 'Rayners Lane', league: 'Isthmian SC' },
    { name: 'South Park (Reigate)', league: 'Isthmian SC' },
    { name: 'Sutton Common Rovers', league: 'Isthmian SC' },
    { name: 'Thatcham Town', league: 'Isthmian SC' },
    { name: 'Tooting & Mitcham United', league: 'Isthmian SC' },
    { name: 'Uxbridge', league: 'Isthmian SC' },
    { name: 'Westfield', league: 'Isthmian SC' },
    { name: 'Windsor & Eton', league: 'Isthmian SC' },
    { name: 'Hayes & Yeading United', league: 'Isthmian SC' },
    { name: 'Walton & Hersham', league: 'Isthmian SC' },
    { name: 'Chertsey Town', league: 'Isthmian SC' },
    { name: 'Ashford Town', league: 'Isthmian SC' },
    { name: 'Bracknell Town', league: 'Isthmian SC' },
    { name: 'AFC Sudbury', league: 'Isthmian North' },
    { name: 'Barking', league: 'Isthmian North' },
    { name: 'Basildon United', league: 'Isthmian North' },
    { name: 'Brightlingsea Regent', league: 'Isthmian North' },
    { name: 'Bury Town', league: 'Isthmian North' },
    { name: 'Cambridge City', league: 'Isthmian North' },
    { name: 'Coggeshall Town', league: 'Isthmian North' },
    { name: 'Dereham Town', league: 'Isthmian North' },
    { name: 'Felixstowe & Walton', league: 'Isthmian North' },
    { name: 'Grays Athletic', league: 'Isthmian North' },
    { name: 'Great Wakering Rovers', league: 'Isthmian North' },
    { name: 'Heybridge Swifts', league: 'Isthmian North' },
    { name: 'Hullbridge Sports', league: 'Isthmian North' },
    { name: 'Maldon & Tiptree', league: 'Isthmian North' },
    { name: 'New Salamis', league: 'Isthmian North' },
    { name: 'Norwich United', league: 'Isthmian North' },
    { name: 'Romford', league: 'Isthmian North' },
    { name: 'Stowmarket Town', league: 'Isthmian North' },
    { name: 'Tilbury', league: 'Isthmian North' },
    { name: 'Walthamstow', league: 'Isthmian North' },
    { name: 'Witham Town', league: 'Isthmian North' },
    { name: 'Wroxham', league: 'Isthmian North' }
];

async function populateClubs() {
    console.log('Starting club directory population...');
    
    const userId = await createSystemUser();
    if (!userId) {
        console.error('Failed to create system user');
        return;
    }
    
    console.log(`System user created/found with ID: ${userId}`);
    
    const stmt = db.prepare(`
        INSERT INTO clubs (user_id, club_name, location, level, description, staff_info)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const club of clubs) {
        try {
            // Check if club already exists
            const existing = db.prepare('SELECT id FROM clubs WHERE club_name = ?').get(club.name);
            if (existing) {
                console.log(`Skipping ${club.name} - already exists`);
                skipCount++;
                continue;
            }
            
            stmt.run(
                userId,
                club.name,
                'England', // Default location
                club.league,
                `Official club directory entry for ${club.name}`,
                'Club Directory Entry'
            );
            successCount++;
            console.log(`✓ Added ${club.name} (${club.league})`);
        } catch (error) {
            console.error(`Failed to add ${club.name}:`, error.message);
        }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log(`Club Directory Population Complete!`);
    console.log(`Total clubs: ${clubs.length}`);
    console.log(`Successfully added: ${successCount}`);
    console.log(`Skipped (already exist): ${skipCount}`);
    console.log('═══════════════════════════════════════\n');
}

// Run the population
populateClubs()
    .then(() => {
        db.close();
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        db.close();
        process.exit(1);
    });
