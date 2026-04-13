
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
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
const auth = getAuth(app);
const db = getDatabase(app);

const teams = [
    { id: "t1", name: "Mahakal XI" },
    { id: "t2", name: "Choice XI" },
    { id: "t3", name: "Maa Durga Cricket Club" },
    { id: "t4", name: "Laxmi Narayan Cricket Club" },
    { id: "t5", name: "Western Tigers" },
    { id: "t6", name: "Kaushal Tigers" },
    { id: "t7", name: "Veterans United" },
    { id: "t8", name: "Samlei Super Kings" },
    { id: "t9", name: "Samleswari Club" },
    { id: "t10", name: "Sambalpur Titans" }
];

(async () => {
    console.log("Creating Owner Accounts...");
    const credentials = [];

    for (const team of teams) {
        const email = `owner.${team.id}@kpl.com`;
        const password = `KPL@${team.id.toUpperCase()}#2025`; // e.g. KPL@T1#2025

        try {
            console.log(`Creating user for ${team.id} (${email})...`);

            // Note: In a real script we might check if exists or use admin SDK. 
            // Here, client SDK createUser will fail if exists. We'll catch and assume it exists or log error.
            let user;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
                console.log(`User created: ${user.uid}`);
            } catch (e) {
                if (e.code === 'auth/email-already-in-use') {
                    console.log("User already exists, updating DB record...");
                    // We can't get UID easily without signing in, but for database key we only need email sanitize
                } else {
                    throw e;
                }
            }

            // Register in Database Allowlist
            const sanitizedEmail = email.replace(/\./g, ',');
            await set(ref(db, `owners/${sanitizedEmail}`), {
                role: 'owner',
                teamId: team.id,
                email: email,
                name: team.name
            });
            console.log(`Database record updated for ${team.id}`);

            credentials.push({
                Team: team.name,
                TeamID: team.id,
                Email: email,
                Password: password
            });

        } catch (err) {
            console.error(`Failed to process ${team.id}:`, err.message);
        }
    }

    console.log("\n--- CREDENTIALS ---");
    console.table(credentials);

    // Write to a file for the user
    fs.writeFileSync('owner_credentials_table.txt', JSON.stringify(credentials, null, 2));

    console.log("Done.");
    process.exit(0);
})();
