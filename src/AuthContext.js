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
        
        // 🔄 Force token refresh to ensure email_verified claim is updated
        await currentUser.getIdToken(true);
        
        // 🔄 Wait a moment for token to propagate in SDK
        await new Promise(resolve => setTimeout(resolve, 500));

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
          console.log("✅ User document found in Firestore");
        } else {
          // 🔹 Document doesn't exist - check if pending data exists
          const pendingAdminData = localStorage.getItem('pendingAdminData');
          const pendingUserData = localStorage.getItem('pendingUserData');
          
          let pendingData = null;
          let storageKey = null;
          
          if (pendingAdminData) {
            pendingData = JSON.parse(pendingAdminData);
            storageKey = 'pendingAdminData';
            console.log("📦 Found pending admin data");
          } else if (pendingUserData) {
            pendingData = JSON.parse(pendingUserData);
            storageKey = 'pendingUserData';
            console.log("📦 Found pending user data");
          }
          
          if (pendingData) {
            // Verify it's for this user
            if (pendingData.uid === currentUser.uid) {
              // ✅ Create document NOW (after email verification)
              userData = {
                name: pendingData.name,
                email: pendingData.email,
                department: pendingData.department,
                year: pendingData.year,
                interests: pendingData.interests || [],
                role: pendingData.role || "user",
                createdAt: new Date()
              };
              
              console.log(`🔨 Creating ${userData.role} document in Firestore...`);
              await setDoc(docRef, userData);
              localStorage.removeItem(storageKey);
              console.log(`✅ ${userData.role} document created successfully!`);
            } else {
              console.error("❌ UID mismatch in pending data");
              await signOut(auth);
              setUser(null);
              return;
            }
          } else {
            // No document and no pending data - shouldn't happen with proper signup
            console.error("❌ User document not found and no pending data!");
            await signOut(auth);
            setUser(null);
            return;
          }
        }
        
        console.log(
          "👤 AUTH displayName:",
          currentUser.displayName,
          "| FIRESTORE name:",
          userData?.name,
          "| ROLE:",
          userData?.role,
          "| IS_ADMIN:",
          userData?.role === "admin"
        );

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
          name: userData?.name || "Student",
          department: userData?.department || "",
          year: userData?.year || "",
          interests: userData?.interests || [],
          role: userData?.role || "user",
          isAdmin: userData?.role === "admin",
          profileComplete: isProfileComplete
        });

      } catch (err) {
        console.error("❌ AuthContext error:", err);
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