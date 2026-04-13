
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

const logoUpdates = {
    "t1": "/teams/mahakal_xi_logo.png?v=1",
    "t2": "/teams/choice_xi_logo_new.png?v=1",
    "t3": "/teams/maa_durga_logo.png?v=1",
    "t4": "/teams/lncc_logo.jpg?v=1",
    "t5": "/teams/western_tigers_logo.png?v=1",
    "t6": "/teams/kaushal_tigers_logo.png?v=1",
    "t7": "/teams/veterans_united_logo.jpg?v=1",
    "t8": "/teams/samlei_super_kings_logo.jpg?v=1",
    "t9": "/teams/samleswari_club_logo.png?v=1",
    "t10": "/teams/sambalpur_titans_logo.jpg?v=1"
};

(async () => {
    try {
        console.log("Updating Team Logos in Firebase...");
        const updates = {};

        for (const [teamId, iconPath] of Object.entries(logoUpdates)) {
            console.log(`Setting logo for ${teamId} -> ${iconPath}`);
            updates[`teams/${teamId}/icon`] = iconPath;
        }

        await update(ref(db), updates);
        console.log("SUCCESS: Logos updated!");
        process.exit(0);

    } catch (e) {
        console.error("Update Failed:", e);
        process.exit(1);
    }
})();
