import { doc, getDoc, collection, addDoc, deleteDoc, query, where, getDocs } from "firebase/firestore"; 
import React, { useState, useEffect, useContext } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { AuthContext } from './AuthContext'; 
import { db } from './firebase'; 
import './EventDetails.css';

const EventDetails = () => {
  const { user } = useContext(AuthContext); 
  const { eventId } = useParams(); 
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent(docSnap.data());
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchEvent();
  }, [eventId]);

  const checkConflict = async () => {
    const registrationsRef = collection(db, "registrations");
    const q = query(
      registrationsRef,
      where("userEmail", "==", user.email),
      where("date", "==", event.date),
      where("startTime", "==", event.startTime)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleRSVP = async () => {
    if (!user) {
      alert("Login to your SSN account!");
      return;
    }

    const conflict = await checkConflict();

    if (conflict) {
      const replace = window.confirm("You already have an event at this time. Replace it?");
      if (!replace) return;

      const q = query(
        collection(db, "registrations"),
        where("userEmail", "==", user.email),
        where("date", "==", event.date),
        where("startTime", "==", event.startTime)
      );
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, "registrations", docSnap.id));
      }
    }

    // FIXED: Added backticks and template literal
    const confirmAction = window.confirm(`Confirm registration for ${event.title}?`);
    if (!confirmAction) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "registrations"), {
        userEmail: user.email,
        eventId: eventId || "ssn_event",
        eventTitle: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        registeredAt: new Date()
      });

      setIsRegistered(true);
      alert("Registration Successful!");
      navigate('/dashboard'); // FIXED: navigates back to dashboard correctly
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <div className="loading">Connecting to SSN...</div>;

  return (
    <div className="event-detail-page">
      <div className="ssn-header"><h2>SSN</h2></div>
      <div className="poster-container">
        <img src={event.posterUrl} alt="SSN Event" />
      </div>
      <div className="content-section">
        <h1>{event.title}</h1>
        <div className="info-grid">
          <div className="info-item"><strong>Date:</strong> {event.date}</div>
          <div className="info-item"><strong>Venue:</strong> {event.venue}</div>
        </div>
        <div className="description-box">{event.description}</div>
        
        {/* FIXED: Corrected className syntax */}
        <button 
          className={`rsvp-button ${isRegistered ? 'registered' : ''}`} 
          onClick={handleRSVP}
          disabled={loading || isRegistered}
        >
          {loading ? "Processing..." : isRegistered ? "✓ Registered" : "Confirm RSVP"}
        </button>
      </div>
    </div>
  );
};

export default EventDetails;