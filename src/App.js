import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import Signup from "./Signup";
import Login from "./Log";
import EventDetails from './EventDetails';
import MyEvents from './MyEvents';
// --- ADDED THIS LINE BELOW TO ENABLE NAVIGATION ---
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
    <Router>
      <div className="App">
        <Routes>
          {/* 1. MEMBER A'S WORK (The Home Page) */}
          <Route path="/" element={
            <div>
              {user ? (
                <>
                  <h2>Welcome {user.name}</h2>
                  <button onClick={logout}>Logout</button>
                </>
              ) : (
                <>
                  <Signup />
                  <Login />
                </>
              )}
            </div>
          } />

          {/* 2. YOUR WORK (The Event Details Page) */}
          <Route path="/event/:eventId" element={<EventDetails />} />
          
          {/* --- PART 3: THE MY EVENTS (ADD THE ROUTE HERE) --- */}
          <Route path="/my-events" element={<MyEvents />} />
        </Routes>
      </div>
    </Router>
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