
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Load Environment Variables (Manual Parsing)
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.warn("Could not read .env file");
}

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. Import Local Data
// We need to dynamically import because initialData.js is a module
const initialDataPath = path.join(process.cwd(), 'src/data/initialData.js');

(async () => {
    try {
        console.log("Importing initialData.js...");
        // Use dynamic import with file:// protocol for Windows compatibility
        const { initialPlayers } = await import(`file://${initialDataPath}`);

        console.log(`Loaded ${initialPlayers.length} players from local file.`);

        const updates = {};
        let updateCount = 0;

        initialPlayers.forEach(player => {
            // We only want to update the PHOTO URL to avoid overwriting auction status (sold/unsold)
            // if the auction is already running.
            // Path: players/{id}/photo
            updates[`players/${player.id}/photo`] = player.photo;
            updateCount++;
        });

        console.log(`Preparing to update ${updateCount} photos in Firebase...`);

        await update(ref(db), updates);

        console.log("SUCCESS: Firebase updated successfully!");
        process.exit(0);

    } catch (e) {
        console.error("Sync Failed:", e);
        process.exit(1);
    }
})();
