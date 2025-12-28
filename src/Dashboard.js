import React, { useState, useEffect, useContext } from 'react';
import { db, auth } from './firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { AuthContext } from './AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [now, setNow] = useState(new Date()); // ⏱ for live countdown
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 🔄 Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 Fetch events
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 🧮 Calculate remaining time / status
  const getEventStatus = (event) => {
    if (!event.date || !event.startTime || !event.endTime) {
      return { label: "Time not available", color: "#6b7280" };
    }

    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);

    if (now < start) {
      const diffMs = start - now;
      const minutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return { label: `Starts in ${days} day(s)`, color: "#2563eb" };
      if (hours > 0) return { label: `Starts in ${hours} hour(s)`, color: "#2563eb" };
      return { label: `Starts in ${minutes} min(s)`, color: "#2563eb" };
    }

    if (now >= start && now <= end) {
      return { label: "Ongoing now", color: "#16a34a" };
    }

    return { label: "Event ended", color: "#dc2626" };
  };

  // 🔍 Filter events
  const filteredEvents = events.filter(ev => 
    ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (category === "All" || ev.category === category)
  );

  return (
    <div className="dashboard-container">
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Campus Events</h1>
          <button onClick={() => signOut(auth)} className="btn-rsvp btn-going">
            Logout
          </button>
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

      {/* 🧩 Event Cards */}
      <div className="event-grid">
        {filteredEvents.map(event => {
          const status = getEventStatus(event);

          return (
            <div
              key={event.id}
              className="event-card"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <img src={event.posterUrl} className="card-img" alt="" />
              <div className="card-body">
                <div style={{ color: '#5d5fef', fontWeight: 'bold' }}>
                  {event.category}
                </div>

                <h3>{event.title}</h3>

                <p>
                  📍 {event.venue} <br />
                  📅 {event.date} <br />
                  ⏰ {event.startTime} - {event.endTime}
                </p>

                <p style={{ color: status.color, fontWeight: '600' }}>
                  ⏳ {status.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ➕ Admin FAB */}
      {user && user.isAdmin && (
        <button className="fab" onClick={() => navigate('/add-event')}>
          +
        </button>
      )}
    </div>
  );
};

export default Dashboard;
