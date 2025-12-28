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
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // User document exists - load it
            const userData = docSnap.data();

            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              name: userData.name || "",
              department: userData.department || "",
              year: userData.year || "",
              interests: userData.interests || [],
              role: userData.role || "user",
              isAdmin: userData.role === "admin"
            });
            
            console.log("✅ User loaded:", userData.email, "Role:", userData.role);
          } else {
            // User document doesn't exist yet
            // This happens when Firebase Auth creates the user but Firestore write is pending
            console.log("⏳ Waiting for user document to be created...");
            
            // Wait a moment and try again (the signup functions create it)
            setTimeout(async () => {
              const retrySnap = await getDoc(docRef);
              
              if (retrySnap.exists()) {
                const userData = retrySnap.data();
                setUser({
                  uid: currentUser.uid,
                  email: currentUser.email,
                  name: userData.name || "",
                  department: userData.department || "",
                  year: userData.year || "",
                  interests: userData.interests || [],
                  role: userData.role || "user",
                  isAdmin: userData.role === "admin"
                });
                console.log("✅ User document loaded on retry");
              } else {
                // Still doesn't exist - create minimal document
                console.log("⚠️ Creating fallback user document");
                const fallbackData = {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  name: currentUser.displayName || "",
                  department: "",
                  year: "",
                  interests: [],
                  role: "user",
                  createdAt: new Date().toISOString()
                };
                
                await setDoc(docRef, fallbackData);
                
                setUser({
                  uid: currentUser.uid,
                  email: currentUser.email,
                  name: fallbackData.name,
                  department: "",
                  year: "",
                  interests: [],
                  role: "user",
                  isAdmin: false
                });
              }
              setLoading(false);
            }, 1000); // Wait 1 second for Firestore write to complete
            
            return; // Don't set loading to false yet
          }
        } catch (error) {
          console.error("❌ AuthContext error:", error);
          
          // Even if there's an error, try to set basic user info
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            name: "",
            department: "",
            year: "",
            interests: [],
            role: "user",
            isAdmin: false
          });
        }
      } else {
        // User is signed out
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
