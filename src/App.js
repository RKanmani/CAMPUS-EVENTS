import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import Signup from "./Signup";
import Login from "./Log";
import EventDetails from './EventDetails';
import MyEvents from './MyEvents';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const { user } = useContext(AuthContext);
  const [showSignup, setShowSignup] = useState(false);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <div className="App" style={{ margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={
            <div style={{ 
              height: "100vh", 
              width: "100vw", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              // --- THIS PART SETS YOUR IMAGE ---
              backgroundImage: "url('/campus.jpg')", // Ensure image is in public folder
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "fixed",
              top: 0,
              left: 0
            }}>
              {/* This is the white card in your screenshot */}
              <div style={{ 
                backgroundColor: "white", 
                padding: "40px",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                textAlign: "center",
                width: "90%",
                maxWidth: "500px",
                zIndex: 1
              }}>
                {user ? (
                  <>
                    <h2 style={{ color: "#333", marginBottom: "20px" }}>
                      Welcome {user.displayName || user.email} 👋
                    </h2>
                    <button
                      onClick={logout}
                      style={{
                        padding: "12px 25px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#5d5fef", // Matching the purple/blue button in your image
                        color: "white",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {showSignup ? (
                      <Signup onSwitchToLogin={() => setShowSignup(false)} />
                    ) : (
                      <Login onSwitchToSignup={() => setShowSignup(true)} />
                    )}
                  </>
                )}
              </div>
            </div>
          } />

          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="/my-events" element={<MyEvents />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;