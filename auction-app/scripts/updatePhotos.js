/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority: Local CSV -> Google Sheet (Backup)
const LOCAL_CSV = path.join(__dirname, '../photos.csv');
const TARGET_FILE = path.join(__dirname, '../src/data/initialData.js');

// Helper to fetch CSV from URL
const fetchCSV = (url) => {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchCSV(res.headers.location).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch CSV: Status Code ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });
};

const convertDriveLink = (link) => {
    if (!link) return null;

    // Pattern 1: id=...
    let idMatch = link.match(/id=([a-zA-Z0-9_-]+)/);

    // Pattern 2: /d/.../
    if (!idMatch) {
        idMatch = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
    }

    // Pattern 3: open?id=... (covered by Pattern 1 usually, but explicit check good)

    if (idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
    return link;
};

(async () => {
    try {
        let csvData = '';

        if (fs.existsSync(LOCAL_CSV)) {
            console.log('Reading from local photos.csv...');
            csvData = fs.readFileSync(LOCAL_CSV, 'utf8');
        } else {
            console.error('ERROR: photos.csv not found in root or scripts folder.');
            console.log('Please create photos.csv with columns: Player Name, Photo URL');
            process.exit(1);
        }

        const rows = csvData.split(/\r?\n/).filter(r => r.trim() !== '');
        if (rows.length === 0) return;

        // Smart Header Detection
        const headers = rows[0].split(/,|\t/).map(h => h.trim().toUpperCase());

        // Find columns containing "NAME" and "PHOTO" or "URL"
        const nameIndex = headers.findIndex(h => h.includes('NAME'));
        const photoIndex = headers.findIndex(h => h.includes('PHOTO') || h.includes('URL'));

        console.log(`Headers: ${headers.join(', ')}`);
        console.log(`Detected Indices -> Name: ${nameIndex}, Photo: ${photoIndex}`);

        if (nameIndex === -1 || photoIndex === -1) {
            console.error('CRITICAL: Could not identify Name or Photo columns automatically.');
            process.exit(1);
        }

        const photoMap = new Map();

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // Handle both CSV (comma) and Excel copy-paste (tab)
            const cols = row.split(/,|\t/).map(c => c.trim());

            if (cols.length > Math.max(nameIndex, photoIndex)) {
                let rawName = cols[nameIndex];
                let rawPhoto = cols[photoIndex];

                // Remove quotes if present
                rawName = rawName.replace(/^"|"$/g, '');
                rawPhoto = rawPhoto.replace(/^"|"$/g, '');

                if (rawName && rawPhoto && rawPhoto.includes('http')) {
                    photoMap.set(rawName.toLowerCase(), convertDriveLink(rawPhoto));
                }
            }
        }

        console.log(`Found ${photoMap.size} valid photo entries.`);

        // Read Target File
        let fileContent = fs.readFileSync(TARGET_FILE, 'utf8');
        let updateCount = 0;

        // Regex to find player objects and their photo property
        // Matches: name: "Name", ... photo: "OldUrl"
        // We look for name first, then capture until photo

        // Strategy: Iterate over map keys, find them in file, replace photo
        // This is safe because names are unique enough in this context

        // Simplified Regex: looks for `name: "NAME"` ... `photo: "URL"`
        // We'll traverse the file content to be safer or just use a robust replace

        for (const [name, newPhotoUrl] of photoMap.entries()) {
            // Case insensitive name match in file
            // Look for name: "Name"
            const nameRegex = new RegExp(`(name:\\s*["'])(${name})(["'][\\s\\S]*?photo:\\s*["'])([^"']*)(["'])`, 'yi');
            // 'y' is sticky, maybe not good for global search. 
            // Let's use string replace with global function but we need to match specific names.

            // Better: Global replace for all players
            // But we need to match EACH name. 
            // Let's rely on the previous approach: Global Regex for ALL players, check if name is in map.
        }

        const playerRegex = /(name:\s*["'])([^"']+)(["'][\s\S]*?photo:\s*["'])([^"']*)(["'])/gi;

        const newContent = fileContent.replace(playerRegex, (match, prefix, foundName, middle, oldPhoto, suffix) => {
            const normalizedName = foundName.trim().toLowerCase();
            const newPhoto = photoMap.get(normalizedName);

            if (newPhoto) {
                updateCount++;
                // console.log(`Updating ${foundName} -> ${newPhoto}`);
                return `${prefix}${foundName}${middle}${newPhoto}${suffix}`;
            }
            return match;
        });

        fs.writeFileSync(TARGET_FILE, newContent);
        console.log(`SUCCESS: Updated ${updateCount} player photos in initialData.js`);

    } catch (e) {
        console.error('Script Failed:', e);
    }
})();
