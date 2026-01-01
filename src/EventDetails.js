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
  const [year, month, day] = event.date.split("-");
  const [sh, sm] = event.startTime.split(":");
  const [eh, em] = event.endTime.split(":");

  const startDate = new Date(year, month - 1, day, sh, sm);
  const endDate = new Date(year, month - 1, day, eh, em);

  const formatUTC = (date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const start = formatUTC(startDate);
  const end = formatUTC(endDate);

  return (
    `https://www.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${start}/${end}` +
    `&details=${encodeURIComponent(event.description || "Campus Event")}` +
    `&location=${encodeURIComponent(event.venue || "")}`
  );
};
/* ======================================================= */

const EventDetails = () => {
  const { user } = useContext(AuthContext);
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

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

  const handleRSVP = async () => {
    if (!user) {
      alert("Please login first!");
      return;
    }

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
        registeredAt: new Date().toISOString(),
      });

      setIsRegistered(true);
      alert("Registered successfully!");
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleCancelRSVP = async () => {
    const q = query(
      collection(db, "registrations"),
      where("userId", "==", user.uid),
      where("eventId", "==", eventId)
    );

    const res = await getDocs(q);
    for (const d of res.docs) {
      await deleteDoc(doc(db, "registrations", d.id));
    }

    setIsRegistered(false);
    alert("Registration cancelled");
  };

  if (!event) return <div className="loading">Loading...</div>;

  return (
    <div className="event-detail-page">
      <div className="ssn-header">
        <h2>SSN</h2>
      </div>

      <div className="poster-container">
        <img src={event.posterUrl} alt="Event Poster" />
      </div>

      <div className="content-section">
        <h1>{event.title}</h1>

        <div className="info-grid">
          <div className="info-item">
            <strong>Date:</strong> {event.date}
          </div>
          <div className="info-item">
            <strong>Venue:</strong> {event.venue}
          </div>
        </div>

        <div className="description-box">{event.description}</div>

        {isRegistered ? (
          <>
            <button
              className="rsvp-button registered"
              onClick={handleCancelRSVP}
            >
              Cancel Registration
            </button>

            <a
              href={generateGoogleCalendarLink(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-btn"
            >
              📅 Add to Google Calendar
            </a>
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
