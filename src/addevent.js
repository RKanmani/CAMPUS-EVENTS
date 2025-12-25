import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddEvent = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Technical', subCategory: '',
    date: '', startTime: '', endTime: '', venue: '', posterUrl: '', createdBy: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // PHASE 1: Writing the real schema to Firestore
      await addDoc(collection(db, "events"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      alert("Event Added Successfully! Bruh, you're a pro.");
    } catch (err) {
      console.error("Error adding event: ", err);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", background: "white", borderRadius: "12px" }}>
      <h2>Add New Campus Event</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input placeholder="Event Title" onChange={e => setFormData({...formData, title: e.target.value})} required />
        <textarea placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} />
        
        <div style={{ display: "flex", gap: "10px" }}>
          <select onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
          </select>
          <input type="date" onChange={e => setFormData({...formData, date: e.target.value})} required />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input type="time" placeholder="Start" onChange={e => setFormData({...formData, startTime: e.target.value})} required />
          <input type="time" placeholder="End" onChange={e => setFormData({...formData, endTime: e.target.value})} required />
        </div>

        <input placeholder="Venue" onChange={e => setFormData({...formData, venue: e.target.value})} required />
        <input placeholder="Poster Image URL" onChange={e => setFormData({...formData, posterUrl: e.target.value})} required />
        <input placeholder="Club Name (Created By)" onChange={e => setFormData({...formData, createdBy: e.target.value})} required />

        <button type="submit" style={{ padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Publish Event
        </button>
      </form>
    </div>
  );
};

export default AddEvent;