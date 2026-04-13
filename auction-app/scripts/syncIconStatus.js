
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, get } from "firebase/database";
import fs from 'fs';
import path from 'path';

// 1. Load Environment Variables
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const iconPlayers = [
    '126', '35', '79', '117', '83', '105', '54', '121', '78', '136'
];

(async () => {
    try {
        console.log("Syncing Icon Status to Firebase...");
        const updates = {};

        for (const pid of iconPlayers) {
            console.log(`Setting isIcon=true for player ${pid}`);
            updates[`players/${pid}/isIcon`] = true;
            // Ensure status is SOLD (redundant but safe)
            updates[`players/${pid}/status`] = "SOLD";
        }

        await update(ref(db), updates);
        console.log("SUCCESS: Icon status synced!");
        process.exit(0);

    } catch (e) {
        console.error("Sync Failed:", e);
        process.exit(1);
    }
})();
