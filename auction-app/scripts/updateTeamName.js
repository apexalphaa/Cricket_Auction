
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import fs from 'fs';
import path from 'path';

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

(async () => {
    try {
        console.log("Updating Team Name...");
        const updates = {};
        // Update name and icon for t9
        updates['teams/t9/name'] = "Samleswari Club";
        updates['teams/t9/icon'] = "https://via.placeholder.com/50/00FFFF/000000?text=SC";

        await update(ref(db), updates);

        console.log("SUCCESS: Team name updated to Samleswari Club!");
        process.exit(0);

    } catch (e) {
        console.error("Update Failed:", e);
        process.exit(1);
    }
})();
