import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import Signup from "./Signup";
import Login from "./Log";

function App() {
  const { user } = useContext(AuthContext);
  const [showSignup, setShowSignup] = useState(false);

  const logout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb"
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>
          Welcome {user.name} 👋
        </h2>

        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#ef4444",
            color: "white",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      {showSignup ? (
        <Signup onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <Login onSwitchToSignup={() => setShowSignup(true)} />
      )}
    </>
  );
}

export default App;