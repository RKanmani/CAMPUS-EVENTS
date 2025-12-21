import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; // Ensure this path is correct
import { db } from './firebase'; 
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './MyEvents.css';

const MyEvents = () => {
  const { user } = useContext(AuthContext);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Query registrations where userEmail matches logged-in student
        const q = query(
          collection(db, "registrations"), 
          where("userEmail", "==", user.email)
        );
        
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));

        // Sort: Most recent registrations at the top
        const sortedDocs = docs.sort((a, b) => b.registeredAt?.seconds - a.registeredAt?.seconds);
        
        setMyRegistrations(sortedDocs);
      } catch (error) {
        console.error("Error fetching SSN events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  const handleCancelRSVP = async (regId) => {
    const confirmCancel = window.confirm("Do you want to cancel your RSVP for this event?");
    if (confirmCancel) {
      try {
        await deleteDoc(doc(db, "registrations", regId));
        // Update UI immediately
        setMyRegistrations(myRegistrations.filter(reg => reg.id !== regId));
        alert("Registration removed.");
      } catch (error) {
        alert("Error: Could not cancel registration.");
      }
    }
  };

  if (loading) return <div className="loading-screen">Syncing with SSN Database...</div>;

  if (!user) return (
    <div className="login-warning">
      <h2>Access Denied</h2>
      <p>Please login with your SSN credentials to view your events.</p>
      <Link to="/login" className="btn-link">Go to Login</Link>
    </div>
  );

  return (
    <div className="my-events-page">
      <div className="dashboard-header">
        <h1>My SSN Dashboard</h1>
        <p>Logged in as: <strong>{user.email}</strong></p>
      </div>

      <div className="events-container">
        {myRegistrations.length === 0 ? (
          <div className="empty-state">
            <h3>No Registrations Found</h3>
            <p>You haven't signed up for any events yet.</p>
            <Link to="/" className="explore-btn">Explore Events</Link>
          </div>
        ) : (
          myRegistrations.map((reg) => (
            <div key={reg.id} className="event-item-card">
              <div className="event-details">
                <h3>{reg.eventTitle}</h3>
                <p className="reg-date">Registered on: {reg.registeredAt?.toDate().toLocaleDateString()}</p>
                <span className="badge">Confirmed</span>
              </div>
              
              <div className="event-actions">
                <Link to={`/event/${reg.eventId}`} className="view-btn">Details</Link>
                <button 
                  onClick={() => handleCancelRSVP(reg.id)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyEvents;