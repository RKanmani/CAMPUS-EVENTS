import { doc, getDoc, collection, addDoc, deleteDoc, query, where, getDocs } from "firebase/firestore"; 
import React, { useState, useEffect, useContext } from 'react'; 
import { useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext'; 
import { db } from './firebase'; 
import './EventDetails.css';

/* GOOGLE CALENDAR LINK GENERATOR */
const generateGoogleCalendarLink = (event) => {
  if (!event.date || !event.startTime || !event.endTime) return "#";
  try {
    const [year, month, day] = event.date.split("-");
    const [sh, sm] = event.startTime.split(":");
    const [eh, em] = event.endTime.split(":");

    const startDate = new Date(year, month - 1, day, sh, sm);
    const endDate = new Date(year, month - 1, day, eh, em);

    const formatUTC = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatUTC(startDate)}/${formatUTC(endDate)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.venue || "")}`;
  } catch (error) {
    return "#";
  }
};

const EventDetails = () => {
  const { user } = useContext(AuthContext); 
  const { eventId } = useParams(); 
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const openInMaps = () => {
    const venueName = event?.venue || "SSN College of Engineering";
    const query = encodeURIComponent(`${venueName}, SSN College`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "events", eventId);
      const snap = await getDoc(ref);
      if (snap.exists()) setEvent(snap.data());

      if (user) {
        const q = query(collection(db, "registrations"), where("userId", "==", user.uid), where("eventId", "==", eventId));
        const res = await getDocs(q);
        setIsRegistered(!res.empty);
      }
    };
    fetchData();
  }, [eventId, user]);

  const handleRSVP = async () => {
    if (!user) { alert("Please login first!"); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "registrations"), {
        userId: user.uid,
        eventId,
        eventTitle: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        registeredAt: new Date().toISOString()
      });
      setIsRegistered(true);
      alert("Registered successfully!");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const handleCancelRSVP = async () => {
    if (!window.confirm("Cancel this RSVP?")) return;
    const q = query(collection(db, "registrations"), where("userId", "==", user.uid), where("eventId", "==", eventId));
    const res = await getDocs(q);
    for (const d of res.docs) { await deleteDoc(doc(db, "registrations", d.id)); }
    setIsRegistered(false);
    alert("Registration cancelled");
  };

  if (!event) return <div className="loading">Loading...</div>;

  return (
    <div className="event-detail-container">
      <div className="event-card">
        <div className="poster-section"><img src={event.posterUrl} alt="Poster" /></div>
        <div className="content-section">
          <h1>{event.title}</h1>
          <div className="info-grid">
            <p><strong>📅 Date:</strong> {event.date}</p>
            <p><strong>⏰ Time:</strong> {event.startTime} - {event.endTime}</p>
            <div className="venue-row">
              <p><strong>📍 Venue:</strong> {event.venue}</p>
              <button className="maps-mini-btn" onClick={openInMaps}>View on Map</button>
            </div>
          </div>
          <div className="description-container"><p>{event.description}</p></div>
          <div className="action-area">
            {isRegistered ? (
              <div className="registered-options">
                <button className="rsvp-button cancel-btn" onClick={handleCancelRSVP}>Cancel RSVP</button>
                <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="calendar-btn">📅 Google Calendar</a>
              </div>
            ) : (
              <button className="rsvp-button" onClick={handleRSVP} disabled={loading}>{loading ? "Registering..." : "Confirm RSVP"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventDetails;