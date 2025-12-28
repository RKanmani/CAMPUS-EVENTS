import { doc, getDoc, collection, addDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import React, { useState, useEffect, useContext } from 'react'; 
import { useParams } from 'react-router-dom'; 
import { AuthContext } from './AuthContext'; 
import { db } from './firebase'; 
import './EventDetails.css';



const EventDetails = () => {
  const { user } = useContext(AuthContext); 
  const { eventId } = useParams(); 
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
        } else {
          // Dummy data with SSN branding only
          setEvent({
            title: "SSN 2025",
            createdBy: "SSN Technical Club",
            category: "Technology",
            subCategory: "Engineering",
            date: "2025-12-25",
            venue: "SSN Campus",
            description: "Join the biggest event at SSN! Register now to participate.",
            posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"
          });
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
  return !querySnapshot.empty; // returns true if there’s a conflict
};


  const handleRSVP = async () => {
  if (!user) {
    alert("Login to your SSN account!");
    return;
  }

  // 1️⃣ Check for conflict
  const conflict = await checkConflict();

  if (conflict) {
    const replace = window.confirm(
      "You already have an event at this time. Do you want to replace it with this one?"
    );
    if (!replace) return;

    // 2️⃣ Delete the old conflicting RSVP
    const registrationsRef = collection(db, "registrations");
    const q = query(
      registrationsRef,
      where("userEmail", "==", user.email),
      where("date", "==", event.date),
      where("startTime", "==", event.startTime)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "registrations", docSnap.id));
    });
  }

  // 3️⃣ Ask for final confirmation
  const confirmAction = window.confirm(`Confirm registration for ${event.title}?`);
  if (!confirmAction) return;

  // 4️⃣ Add the new registration
  setLoading(true);
  try {
    await addDoc(collection(db, "registrations"), {
      userEmail: user.email,
      eventId: eventId || "ssn_event",
      eventTitle: event.title,
      college: "SSN",
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      registeredAt: new Date()
    });

    setIsRegistered(true);
    alert("Registration Successful!");
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};


  if (!event) return <div className="loading">Connecting to SSN...</div>;

  return (
    <div className="event-detail-page">
      <div className="ssn-header">
        <h2>SSN</h2>
      </div>

      <div className="poster-container">
        <img src={event.posterUrl} alt="SSN Event" />
      </div>
      
      <div className="content-section">
        <h1>{event.title}</h1>
        <p className="organized-by">Organized by: <span>{event.createdBy}</span></p>
        
        <div className="info-grid">
          <div className="info-item"><strong>Date:</strong> {event.date}</div>
          <div className="info-item"><strong>Venue:</strong> {event.venue}</div>
        </div>

        <div className="description-box">
          {event.description}
        </div>
        
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