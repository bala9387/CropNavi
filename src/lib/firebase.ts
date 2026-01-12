
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debugging: Check if keys are loaded
if (typeof window !== 'undefined') {
    console.log("Firebase Config Check:");
    console.log("API Key present:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    console.log("Auth Domain present:", !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    console.log("Project ID present:", !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.warn("Notice: Firebase API Key is missing. Google Login will function in Demo Mode.");
    }
}

// Initialize Firebase (Server-Side Rendering safe)
let app;
let auth;
let googleProvider;

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

if (typeof window !== 'undefined' && isConfigValid) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } catch (e) {
        console.error("Firebase Initialization Error:", e);
    }
}

export { auth, googleProvider };
