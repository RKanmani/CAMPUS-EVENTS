import {
  doc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { db } from "./firebase";
import "./EventDetails.css";

/* ================= GOOGLE CALENDAR LINK ================= */
const generateGoogleCalendarLink = (event) => {
  if (!event.date || !event.startTime) return "#";
  const [year, month, day] = event.date.split("-");
  const [sh, sm] = event.startTime.split(":");
  const [eh, em] = event.endTime.split(":");

  const startDate = new Date(year, month - 1, day, sh, sm);
  const endDate = new Date(year, month - 1, day, eh, em);

  const formatUTC = (date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return (
    `https://www.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${formatUTC(startDate)}/${formatUTC(endDate)}` +
    `&details=${encodeURIComponent(event.description || "Campus Event")}` +
    `&location=${encodeURIComponent(event.venue || "")}`
  );
};

const EventDetails = () => {
  const { user } = useContext(AuthContext);
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  /* ================= FREE GOOGLE MAPS LOGIC ================= */
  const openInMaps = () => {
    const venueName = event?.venue || "SSN College of Engineering";
    // This searches for the venue specifically within SSN for accuracy
    const query = encodeURIComponent(`${venueName}, SSN College of Engineering`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const ref = doc(db, "events", eventId);
      const snap = await getDoc(ref);
      if (snap.exists()) setEvent(snap.data());
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user) return;
      const q = query(
        collection(db, "registrations"),
        where("userId", "==", user.uid),
        where("eventId", "==", eventId)
      );
      const res = await getDocs(q);
      setIsRegistered(!res.empty);
    };
    checkRegistration();
  }, [user, eventId]);

    const checkTimeConflict = async () => {
    const q = query(
      collection(db, "registrations"),
      where("userId", "==", user.uid),
      where("date", "==", event.date),
      where("startTime", "==", event.startTime)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0]; // existing conflicting RSVP
    }
    return null;
  };


  const handleRSVP = async () => {
  if (!user) {
    alert("Please login first!");
    return;
  }

  setLoading(true);

  try {
    // 🔴 Check for conflict
    const conflictDoc = await checkTimeConflict();

    if (conflictDoc) {
      const replace = window.confirm(
        "You already registered for another event at the same time.\n\n" +
        "OK → Cancel old event and register for this one\n" +
        "Cancel → Keep old event"
      );

      if (!replace) {
        setLoading(false);
        return;
      }

      // ❌ Remove older RSVP
      await deleteDoc(conflictDoc.ref);
    }

    // ✅ Add new RSVP
    await addDoc(collection(db, "registrations"), {
      userId: user.uid,
      eventId,
      eventTitle: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      registeredAt: new Date().toISOString(),
    });

    setIsRegistered(true);
    alert("Registered successfully!");
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }

  setLoading(false);
};


  const handleCancelRSVP = async () => {
    if (!window.confirm("Cancel registration?")) return;
    const q = query(collection(db, "registrations"), where("userId", "==", user.uid), where("eventId", "==", eventId));
    const res = await getDocs(q);
    for (const d of res.docs) { await deleteDoc(doc(db, "registrations", d.id)); }
    setIsRegistered(false);
    alert("Registration cancelled");
  };

  if (!event) return <div className="loading">Loading...</div>;

  return (
    <div className="event-detail-page">
      <div className="ssn-header">
        <h2>SSN Events</h2>
      </div>

      <div className="poster-container">
        <img src={event.posterUrl} alt="Event Poster" />
      </div>

      <div className="content-section">
        <h1>{event.title}</h1>

        <div className="info-grid">
          <div className="info-item">
            <strong>📅 Date:</strong> {event.date}
          </div>
          <div className="info-item venue-row">
            <span><strong>📍 Venue:</strong> {event.venue}</span>
            <button className="maps-mini-btn" onClick={openInMaps}>View Map</button>
          </div>
        </div>

        <div className="description-box">{event.description}</div>

        <div className="action-stack">
          {isRegistered ? (
            <>
              <button className="rsvp-button registered" onClick={handleCancelRSVP}>
                Cancel Registration
              </button>
              <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="calendar-btn">
                📅 Add to Google Calendar
              </a>
            </>
          ) : (
            <button className="rsvp-button" onClick={handleRSVP} disabled={loading}>
              {loading ? "Processing..." : "Confirm RSVP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;