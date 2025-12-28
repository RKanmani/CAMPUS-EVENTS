import { doc, getDoc, collection, addDoc, deleteDoc, query, where, getDocs } from "firebase/firestore"; 
import React, { useState, useEffect, useContext } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { AuthContext } from './AuthContext'; 
import { db } from './firebase'; 
import './EventDetails.css';

// Generate Google Calendar link with pre-filled event details
const generateGoogleCalendarLink = (event) => {
  // Parse date and time
  const [year, month, day] = event.date.split("-");
  const [startHour, startMinute] = event.startTime.split(":");
  const [endHour, endMinute] = event.endTime.split(":");

  // Create Date objects in local time
  const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
  const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

  // Format date to YYYYMMDDTHHMMSSZ (UTC)
  const formatDate = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  };

  const start = formatDate(startDateTime);
  const end = formatDate(endDateTime);

  return `https://www.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${start}/${end}` +
    `&details=${encodeURIComponent(event.description || "Campus Event")}` +
    `&location=${encodeURIComponent(event.venue || "")}` +
    `&sf=true&output=xml`;
};

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

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user || !eventId) return;
      try {
        const registrationsRef = collection(db, "registrations");
        const q = query(
          registrationsRef,
          where("userId", "==", user.uid),
          where("eventId", "==", eventId)
        );
        const querySnapshot = await getDocs(q);
        setIsRegistered(!querySnapshot.empty);
      } catch (error) {
        console.error("Error checking registration:", error);
      }
    };
    checkRegistration();
  }, [user, eventId]);

  const checkConflict = async () => {
    const registrationsRef = collection(db, "registrations");
    const q = query(
      registrationsRef,
      where("userId", "==", user.uid),
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
        where("userId", "==", user.uid),
        where("date", "==", event.date),
        where("startTime", "==", event.startTime)
      );
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, "registrations", docSnap.id));
      }
    }

    const confirmAction = window.confirm(`Confirm registration for ${event.title}?`);
    if (!confirmAction) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "registrations"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.name || user.email,
        eventId: eventId || "ssn_event",
        eventTitle: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue || "",
        registeredAt: new Date().toISOString()
      });

      setIsRegistered(true);
      alert("Registration Successful!");
      navigate('/dashboard');
    } catch (error) {
      console.error("❌ RSVP Error:", error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRSVP = async () => {
    if (!user) return;

    const confirmCancel = window.confirm("Are you sure you want to cancel your registration?");
    if (!confirmCancel) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "registrations"),
        where("userId", "==", user.uid),
        where("eventId", "==", eventId)
      );
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, "registrations", docSnap.id));
      }

      setIsRegistered(false);
      alert("Registration cancelled successfully!");
    } catch (error) {
      console.error("❌ Cancel Error:", error);
      alert(`Failed to cancel: ${error.message}`);
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
        
        {isRegistered ? (
          <>
            <button 
              className="rsvp-button registered" 
              onClick={handleCancelRSVP}
              disabled={loading}
            >
              {loading ? "Processing..." : "Cancel Registration"}
            </button>

            {/* Google Calendar Button only visible after RSVP */}
            {event && (
              <a
                href={generateGoogleCalendarLink(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="calendar-btn"
              >
                📅 Add to Google Calendar
              </a>
            )}
          </>
        ) : (
          <button 
            className="rsvp-button" 
            onClick={handleRSVP}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm RSVP"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
