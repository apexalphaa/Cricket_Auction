# How to find your Missing Keys

## Do you need a new project?
**NO.** based on your logs, you already have a project called **`auction-e33d2`**. You can use that one!

## ONE STEP LEFT: Register the "Web App"
Even though you have a project, you might not have told Firebase "I am building a **Website**". You need to do that to get the keys.

1.  **Open this link:** [Firebase Console - Project Settings](https://console.firebase.google.com/project/auction-e33d2/settings/general/)
    *   *If that link doesn't work, go to Console > Select 'Auction' > Gear Icon > Project Settings.*
2.  Scroll down to the bottom section called **"Your apps"**.
3.  **If it's empty**:
    *   Click the **</>** icon (Web).
    *   Name it "Auction Web".
    *   Click "Register app".
4.  **Copy the Keys**:
    *   You will see a code block like `apiKey: "AIzaSy..."`.
    *   Copy these values into your `.env` file.

## Why do I need to do this?
I created the code for you, but I cannot login to your Google account to get these secrets. You must copy them so the specific website knows it belongs to your specific database.

## Final Steps
1.  Paste keys into `.env` and save.
2.  Run `npm run build`.
3.  Run `firebase deploy`.
