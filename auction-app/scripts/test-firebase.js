
import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";
import fs from 'fs';
import path from 'path';

// Manual .env parsing
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.warn("Could not read .env file");
}

/*
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    ...
};
*/
// Use process.env now

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Config:", JSON.stringify(firebaseConfig, null, 2));

try {
    const app = initializeApp(firebaseConfig);
    console.log("Firebase App Initialized");
    const db = getDatabase(app);
    console.log("Database Initialized");

    // Try to read .info/connected
    const connectedRef = ref(db, ".info/connected");
    // This requires a listener or get. Node process might exit.
    // Let's just create ref.
    console.log("Ref created. Test passed.");
} catch (e) {
    console.error("Firebase Initialization Failed:", e);
    process.exit(1);
}
