import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE1DEVcbiN285qrDz-_DzVxeEaRFu5taU",
  authDomain: "campus-events-bad2f.firebaseapp.com",
  projectId: "campus-events-bad2f",
  storageBucket: "campus-events-bad2f.firebasestorage.app",
  messagingSenderId: "708831860876",
  appId: "1:708831860876:web:6c593101324c604cd683a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;