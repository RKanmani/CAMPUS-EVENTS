import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const filteredEvents = events.filter(ev => 
    ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (category === "All" || ev.category === category)
  );

  return (
    <div className="dashboard-container">
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Campus Events</h1>
          <button onClick={() => signOut(auth)} className="btn-rsvp btn-going">Logout</button>
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
            </select>
          </div>
        </div>
      </div>

      <div className="event-grid">
        {filteredEvents.map(event => (
          // FIXED: Added backticks to the navigate path
          <div key={event.id} className="event-card" onClick={() => navigate(`/event/${event.id}`)}>
            <img src={event.posterUrl} className="card-img" alt="" />
            <div className="card-body">
              <div style={{color: '#5d5fef', fontWeight: 'bold'}}>{event.category}</div>
              <h3>{event.title}</h3>
              <p>📍 {event.venue} | 📅 {event.date}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => navigate('/add-event')}>+</button>
    </div>
  );
};

export default Dashboard;