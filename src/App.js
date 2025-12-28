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
  // ✅ hooks first
  const { user } = useContext(AuthContext);
  const [authView, setAuthView] = useState("login");

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthView("login");
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  return (
    <Router>
      <div className="App">

        {/* ⚠️ EMAIL VERIFICATION WARNING (NOT BLOCKING) */}
        {user && !user.emailVerified && (
          <div
            style={{
              background: "#fff3cd",
              padding: "12px",
              margin: "10px",
              borderRadius: "8px",
              textAlign: "center",
              color: "#856404",
              border: "1px solid #ffeeba"
            }}
          >
            ⚠️ Please verify your email to unlock all features.
            <br />
            <button
              onClick={logout}
              style={{ marginTop: "8px" }}
            >
              Logout
            </button>
          </div>
        )}

        {/* ✅ ROUTES ARE ALWAYS RENDERED */}
        <Routes>

          {/* ================= HOME ================= */}
          <Route
            path="/"
            element={
              user ? (
                <div>
                  <button onClick={logout}>🚪 Logout</button>
                  <Dashboard />
                </div>
              ) : (
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

          {/* ================= SIGNUP ROUTES ================= */}
          <Route
            path="/signup/user"
            element={!user ? <SignupUser /> : <Navigate to="/" />}
          />

          <Route
            path="/signup/admin"
            element={!user ? <SignupAdmin /> : <Navigate to="/" />}
          />

          {/* ================= ADMIN ================= */}
          <Route
            path="/add-event"
            element={
              user && user.isAdmin
                ? <AddEvent />
                : <Navigate to="/" />
            }
          />

          {/* ================= USER ================= */}
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
