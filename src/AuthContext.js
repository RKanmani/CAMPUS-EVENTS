import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              name: userData.name,
              department: userData.department,
              year: userData.year,
              interests: userData.interests || [],
              role: userData.role || "user",   // 👈 DEFAULT SAFE
              isAdmin: userData.role === "admin"
            });
          } else {
            // fallback (should not happen normally)
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              role: "user",
              isAdmin: false
            });
          }
        } catch (error) {
          console.error("AuthContext error:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
