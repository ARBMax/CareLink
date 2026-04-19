import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (only works in browser)
let analytics = null;
isSupported().then((yes) => {
  if (yes && firebaseConfig.measurementId) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn("Firebase Analytics initialization skipped:", error);
    }
  }
}).catch(() => {
  // Silently ignore if analytics is not supported in this environment
});

// Test connection to Firestore
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc just to check connectivity
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log("Firebase: Firestore connection verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase: Firestore configuration error - client is offline.");
    }
  }
}

testConnection();

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
