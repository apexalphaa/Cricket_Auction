
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

(async () => {
    try {
        console.log("Fixing Squad Data...");
        const teamsRef = ref(db, 'teams');
        const snapshot = await get(teamsRef);

        if (!snapshot.exists()) {
            console.log("No teams found.");
            process.exit(0);
        }

        const teams = snapshot.val();
        const updates = {};
        let needsUpdate = false;

        Object.keys(teams).forEach(teamId => {
            const team = teams[teamId];
            if (team.squad && Array.isArray(team.squad)) {
                const fixedSquad = team.squad.map(item => {
                    // If item is an object, extract ID. If string, keep it.
                    if (typeof item === 'object' && item !== null && item.id) {
                        console.log(`Fixing item in team ${teamId}:`, item);
                        return item.id;
                    }
                    return item;
                });

                // Check if any change occurred (naive check, but sufficient here)
                // Actually simpler to just overwrite if we processed it.
                updates[`teams/${teamId}/squad`] = fixedSquad;
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            console.log("Pushing fixes to Firebase...");
            await update(ref(db), updates);
            console.log("SUCCESS: Squad data fixed!");
        } else {
            console.log("No fixes needed.");
        }

        process.exit(0);

    } catch (e) {
        console.error("Fix Failed:", e);
        process.exit(1);
    }
})();
