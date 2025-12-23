import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Technical', venue: '',
    date: '', startTime: '', endTime: '', posterUrl: ''
  });

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "events"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'Technical', venue: '', date: '', startTime: '', endTime: '', posterUrl: '' });
    } catch (err) { alert(err.message); }
  };

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
          <input type="text" placeholder="Search events..." className="form-input" onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="form-input" style={{width: '200px'}} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
          </select>
        </div>
      </div>

      <div className="event-grid">
        {filteredEvents.map(event => (
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

      {/* FLOATING PLUS BUTTON */}
      <button className="fab" onClick={() => setShowModal(true)}>+</button>

      {/* ADD EVENT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Event</h2>
            <form onSubmit={handleAddEvent}>
              <input placeholder="Title" required onChange={e => setFormData({...formData, title: e.target.value})} />
              <textarea placeholder="Description" required onChange={e => setFormData({...formData, description: e.target.value})} />
              <select onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
              </select>
              <input type="date" required onChange={e => setFormData({...formData, date: e.target.value})} />
              <div style={{display: 'flex', gap: '10px'}}>
                <input type="time" required onChange={e => setFormData({...formData, startTime: e.target.value})} />
                <input type="time" required onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
              <input placeholder="Venue" required onChange={e => setFormData({...formData, venue: e.target.value})} />
              <input placeholder="Poster Image URL" required onChange={e => setFormData({...formData, posterUrl: e.target.value})} />
              <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                <button type="submit" className="btn-rsvp btn-going" style={{flex: 1}}>Post</button>
                <button type="button" onClick={() => setShowModal(false)} style={{flex: 1}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;