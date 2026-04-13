
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
        console.log("Recalculating Squad Counts...");
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
            const actualCount = team.squad ? team.squad.length : 0;
            const currentStoredCount = team.squad_count || 0;

            console.log(`Team ${team.name} (${teamId}): Actual=${actualCount}, Stored=${currentStoredCount}`);

            if (actualCount !== currentStoredCount) {
                console.log(`-> Updating ${teamId} count to ${actualCount}`);
                updates[`teams/${teamId}/squad_count`] = actualCount;
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            console.log("Pushing count corrections to Firebase...");
            await update(ref(db), updates);
            console.log("SUCCESS: Squad counts updated!");
        } else {
            console.log("All squad counts are already correct.");
        }

        process.exit(0);

    } catch (e) {
        console.error("Fix Failed:", e);
        process.exit(1);
    }
})();
