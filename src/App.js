import { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthContext } from "./AuthContext";

import Login from "./Log";
import SignupUser from "./SignupUser";
import SignupAdmin from "./SignupAdmin";

import Dashboard from "./Dashboard";
import AddEvent from "./addevent";
import EventDetails from "./EventDetails";
import MyEvents from "./MyEvents";
import MyCalendar from "./MyCalendar";

function App() {
  const { user, loading } = useContext(AuthContext);
  const [authView, setAuthView] = useState("login");

  

  // ⏳ Wait for Firebase auth to load
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>

        {/* ================= ROOT ================= */}
        <Route
          path="/"
          element={
            user ? (
              <Dashboard />
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

        {/* ================= USER ROUTES ================= */}
        <Route
          path="/event/:eventId"
          element={user ? <EventDetails /> : <Navigate to="/" />}
        />

        <Route
          path="/my-events"
          element={user ? <MyEvents /> : <Navigate to="/" />}
        />

        <Route
          path="/my-calendar"
          element={user ? <MyCalendar /> : <Navigate to="/" />}
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/add-event"
          element={user?.role === "admin" ? <AddEvent /> : <Navigate to="/" />}
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
