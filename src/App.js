import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import Signup from "./Signup";
import Login from "./Log";
import EventDetails from './EventDetails';
import MyEvents from './MyEvents';
import Dashboard from './Dashboard'; // Import the new feed
import AddEvent from './addevent';     // Import the admin form
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
          {/* MAIN HOME ROUTE */}
          <Route path="/" element={
            <div style={{ 
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
              left: 0
            }}>
              {/* If user is logged in, show the Dashboard. If not, show Login/Signup card */}
              {user ? (
                <div style={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.95)", 
                  padding: "20px",
                  borderRadius: "15px",
                  width: "95%",
                  height: "90vh",
                  overflowY: "auto",
                  zIndex: 1
                }}>
        
                  
                  <Dashboard /> 
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "40px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  textAlign: "center",
                  width: "90%",
                  maxWidth: "450px",
                  zIndex: 1
                }}>
                  {showSignup ? (
                    <Signup onSwitchToLogin={() => setShowSignup(false)} />
                  ) : (
                    <Login onSwitchToSignup={() => setShowSignup(true)} />
                  )}
                </div>
              )}
            </div>
          } />

          {/* ADDITIONAL ROUTES */}
          <Route path="/add-event" element={user ? <AddEvent /> : <Navigate to="/" />} />
          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="/my-events" element={<MyEvents />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;