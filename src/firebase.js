import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE1DEVcbiN285qrDz-_DzVxeEaRFu5taU",
  authDomain: "campus-events-bad2f.firebaseapp.com",
  projectId: "campus-events-bad2f",
  storageBucket: "campus-events-bad2f.appspot.com",
  messagingSenderId: "708831860876",
  appId: "1:708831860876:web:6c593101324c604cd683a9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
