// src/services/api/firebase.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCdO-y5Amiab8r1tvA8zpSeXIKgIbYIgmk",
  authDomain: "raksha-app-a8d60.firebaseapp.com",
  projectId: "raksha-app-a8d60",
  storageBucket: "raksha-app-a8d60.firebasestorage.app",
  messagingSenderId: "1071358980668",
  appId: "1:1071358980668:web:a61ad8278b6a9b89334939",
  measurementId: "G-0QFXE2X2PF"
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Export auth instance
export const auth = getAuth(app);

// Optional: export the app itself
export default app;
