import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import SignupAdmin from "./SignupAdmin";
import SignupUser from "./SignupUser";
import Login from "./Log";
import EventDetails from "./EventDetails";
import MyEvents from "./MyEvents";
import Dashboard from "./Dashboard";
import AddEvent from "./addevent";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const { user } = useContext(AuthContext);
  const [authView, setAuthView] = useState("login"); // "login", "signup-user", "signup-admin"

  const logout = async () => {
    try {
      await signOut(auth);
      // User will be automatically redirected to login by AuthContext
      setAuthView("login"); // Reset to login view
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <Router>
      <div className="App" style={{ margin: 0, padding: 0 }}>
        <Routes>

          {/* MAIN HOME ROUTE */}
          <Route
            path="/"
            element={
              user ? (
                <div
                  style={{
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundImage: "url('/campus.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "fixed",
                    top: 0,
                    left: 0,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      padding: "20px",
                      borderRadius: "15px",
                      width: "95%",
                      height: "90vh",
                      overflowY: "auto",
                      zIndex: 1,
                      position: "relative",
                    }}
                  >
                    {/* Logout Button */}
                    <button
                      onClick={logout}
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        padding: "10px 20px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#dc2626";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#ef4444";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.3)";
                      }}
                    >
                      🚪 Logout
                    </button>

                    <Dashboard />

                    {/* OPTIONAL: Admin badge */}
                    {user.isAdmin && (
                      <p style={{ textAlign: "center", color: "#4f46e5" }}>
                        Admin Mode Enabled
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Use the improved auth components with proper styling
                <>
                  {authView === "login" && (
                    <Login onSwitchToSignup={() => setAuthView("signup-user")} />
                  )}
                  
                  {authView === "signup-user" && (
                    <SignupUser 
                      onSwitchToLogin={() => setAuthView("login")}
                      onSwitchToAdmin={() => setAuthView("signup-admin")}
                    />
                  )}
                  
                  {authView === "signup-admin" && (
                    <SignupAdmin 
                      onSwitchToLogin={() => setAuthView("login")}
                      onSwitchToUser={() => setAuthView("signup-user")}
                    />
                  )}
                </>
              )
            }
          />

          {/* ADMIN ONLY ROUTE */}
          <Route
            path="/add-event"
            element={user && user.isAdmin ? <AddEvent /> : <Navigate to="/" />}
          />

          {/* USER ROUTES */}
          <Route
            path="/event/:eventId"
            element={user ? <EventDetails /> : <Navigate to="/" />}
          />

          <Route
            path="/my-events"
            element={user ? <MyEvents /> : <Navigate to="/" />}
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;