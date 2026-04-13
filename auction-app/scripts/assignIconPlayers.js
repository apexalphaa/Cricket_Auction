
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

const assignments = [
    { teamId: 't3', playerId: '126', playerName: 'Rama Bhoi' },
    { teamId: 't2', playerId: '35', playerName: 'Sujeet' },
    { teamId: 't4', playerId: '79', playerName: 'Panchanan Pradhan' },
    { teamId: 't1', playerId: '117', playerName: 'Ashish Ku. Singh' },
    { teamId: 't10', playerId: '83', playerName: 'Subham mudliyar' },
    { teamId: 't8', playerId: '105', playerName: 'Sanjay Prashad Ray' },
    { teamId: 't7', playerId: '54', playerName: 'Sameer prusti' },
    { teamId: 't5', playerId: '121', playerName: 'Deepak Singh' },
    { teamId: 't6', playerId: '78', playerName: 'Sourav sahu' },
    { teamId: 't9', playerId: '136', playerName: 'Aditya Sharma' }
];

(async () => {
    try {
        console.log("Assigning Icon Players...");
        const updates = {};

        for (const assign of assignments) {
            console.log(`Processing ${assign.playerName} -> ${assign.teamId}`);

            // 1. Update Player Status
            // We set them as SOLD to the respective team
            updates[`players/${assign.playerId}/status`] = "SOLD";
            updates[`players/${assign.playerId}/team`] = assign.teamId;
            updates[`players/${assign.playerId}/sold_price`] = 0; // Icon players often don't cost purse or are fixed
            updates[`players/${assign.playerId}/isIcon`] = true;

            // 2. Add to Team Squad
            // We need to fetch current squad first to append? 
            // Or strictly speaking, we can just push if using array logic, but Firebase arrays are tricky with indices.
            // Safer to read current team, check if player exists, if not add.
            // But for a batch update via 'update', we can't read-modify-write easily in one go without transaction.
            // However, since we are admin script, we can do it sequentially.
        }

        // We will do a transaction for each team or just simple read-write for squads.
        // Let's do read-modify-write for squads.

        // Update players first (simple map)

        // Wait, for squads, we need to know the next index.
        const teamUpdates = {};

        for (const assign of assignments) {
            const teamRef = ref(db, `teams/${assign.teamId}`);
            const snapshot = await get(teamRef);
            if (snapshot.exists()) {
                const teamData = snapshot.val();
                let squad = teamData.squad || [];

                // Check if already in squad
                if (!squad.some(p => p.id === assign.playerId)) {
                    squad.push({
                        id: assign.playerId,
                        name: assign.playerName,
                        price: 0,
                        isIcon: true
                    });
                    teamUpdates[`teams/${assign.teamId}/squad`] = squad;
                }
            }
        }

        // Merge updates
        Object.assign(updates, teamUpdates);

        await update(ref(db), updates);

        console.log("SUCCESS: Icon players assigned successfully!");
        process.exit(0);

    } catch (e) {
        console.error("Assignment Failed:", e);
        process.exit(1);
    }
})();
