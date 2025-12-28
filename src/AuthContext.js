import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // 🔥 IMPORTANT: refresh verification status
          await currentUser.reload();

          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          let userData;

          if (docSnap.exists()) {
            userData = docSnap.data();
          } else {
            // fallback user doc
            userData = {
              name: currentUser.displayName || "",
              department: "",
              year: "",
              interests: [],
              role: "user",
              createdAt: new Date()
            };
            await setDoc(docRef, userData);
          }

          // ✅ KEEP Firebase user + add Firestore data
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified, // ✅ ADD THIS
            name: userData.name || "",
            department: userData.department || "",
            year: userData.year || "",
            interests: userData.interests || [],
            role: userData.role || "user",
            isAdmin: userData.role === "admin"
          });


        } else {
          setUser(null);
        }
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
