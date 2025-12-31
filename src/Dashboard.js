import React, { useState, useEffect, useContext } from "react";
import { db, auth } from "./firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [now, setNow] = useState(new Date());

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  /* ================= LIVE CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  /* ================= EVENT STATUS ================= */
  const getEventStatus = (event) => {
    if (!event.date) {
      return { label: "Date not available", color: "#6b7280" };
    }

    const startTime = event.startTime || "10:00";
    const endTime = event.endTime || "12:00";

    const start = new Date(`${event.date}T${startTime}`);
    const end = new Date(`${event.date}T${endTime}`);

    if (now < start) {
      const diff = Math.floor((start - now) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      return {
        label: `Starts in ${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
        color: "#2563eb",
      };
    }

    if (now >= start && now <= end) {
      return { label: "Ongoing now", color: "#16a34a" };
    }

    return { label: "Event ended", color: "#dc2626" };
  };

  /* ================= UPCOMING SOON ================= */
  const isUpcomingSoon = (event) => {
    if (!event.date) return false;
    const startTime = event.startTime || "10:00";
    const start = new Date(`${event.date}T${startTime}`);
    const diffHours = (start - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  /* ================= FILTER EVENTS ================= */
  const filteredEvents = events.filter((ev) => {
    if (!ev.date) return false;

    const endTime = ev.endTime || "12:00";
    const eventEnd = new Date(`${ev.date}T${endTime}`);
    if (eventEnd < now) return false;

    return (
      ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "All" || ev.category === category)
    );
  });

  return (
    <div className="dashboard-container">
      <div className="glass-panel">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Campus Events</h1>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate("/my-calendar")}
              className="btn-rsvp"
            >
              📅 My Calendar
            </button>

            <button
              onClick={() => signOut(auth)}
              className="btn-rsvp btn-going"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="search-filter-bar">
          <div className="search-box">
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="Search events..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <span className="icon">🏷️</span>
            <select onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
        </div>
      </div>

      <div className="event-grid">
        {filteredEvents.map((event) => {
          const status = getEventStatus(event);

          return (
            <div
              key={event.id}
              className={`event-card ${
                isUpcomingSoon(event) ? "highlight" : ""
              }`}
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <img src={event.posterUrl} className="card-img" alt="" />

              <div className="card-body">
                <div style={{ color: "#5d5fef", fontWeight: "bold" }}>
                  {event.category}
                </div>

                <h3>{event.title}</h3>

                <p>
                  📍 {event.venue}
                  <br />
                  📅 {event.date}
                  <br />
                  ⏰ {event.startTime || "10:00"} -{" "}
                  {event.endTime || "12:00"}
                </p>

                <p style={{ color: status.color, fontWeight: "600" }}>
                  ⏳ {status.label}
                </p>

                {isUpcomingSoon(event) && (
                  <p style={{ color: "#f59e0b", fontWeight: "600" }}>
                    🔔 Reminder: Event starts soon!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {user && user.isAdmin && (
        <button className="fab" onClick={() => navigate("/add-event")}>
          +
        </button>
      )}
    </div>
  );
};

export default Dashboard;
