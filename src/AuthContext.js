import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

// ✅ SSN email rule
const isSSNEmail = (email) => {
  return /^[a-zA-Z]+[0-9]{7}@ssn\.edu\.in$/.test(email);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          return;
        }

        // 🔄 Always refresh user (important for emailVerified)
        await currentUser.reload();

        // ❌ BLOCK: email not verified
        if (!currentUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          return;
        }

        // ❌ BLOCK: non-SSN email (including old Gmail users)
        if (!isSSNEmail(currentUser.email)) {
          await signOut(auth);
          setUser(null);
          return;
        }

        // 🔹 Fetch Firestore user data
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        let userData;

        if (docSnap.exists()) {
          userData = docSnap.data();
        } else {
          // 🔹 Create fallback document (safe)
          userData = {
            name: currentUser.displayName || "",
            email: currentUser.email,
            department: "",
            year: "",
            interests: [],
            role: "user",
            createdAt: new Date()
          };
          await setDoc(docRef, userData);
        }

        // ✅ ALLOWED USER (verified + SSN)
        const isProfileComplete =
          userData.department &&
          userData.year &&
          userData.interests &&
          userData.interests.length > 0;

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
          name: userData.name || "",
          department: userData.department || "",
          year: userData.year || "",
          interests: userData.interests || [],
          role: userData.role || "user",
          isAdmin: userData.role === "admin",
          profileComplete: isProfileComplete   // 🔥 ADD THIS
        });

      } catch (err) {
        console.error("AuthContext error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
