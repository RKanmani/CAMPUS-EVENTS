import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './addevent.css';

const AddEvent = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    subCategory: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    posterUrl: '',
    createdBy: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PHASE 1: Writing the real schema to Firestore
      await addDoc(collection(db, "events"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      
      alert("Event Added Successfully!");
      navigate('/');
    } catch (err) {
      console.error("Error adding event: ", err);
      alert("Failed to add event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-event-container">
      <div className="add-event-card">
        <div className="add-event-header">
          <h2>Add New Campus Event</h2>
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subCategory">Sub Category</label>
              <input
                type="text"
                id="subCategory"
                name="subCategory"
                className="form-input"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="e.g., Hackathon, Dance"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                className="form-input"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                className="form-input"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue *</label>
            <input
              type="text"
              id="venue"
              name="venue"
              className="form-input"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Event location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="posterUrl">Poster Image URL *</label>
            <input
              type="url"
              id="posterUrl"
              name="posterUrl"
              className="form-input"
              value={formData.posterUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.posterUrl && (
              <div className="image-preview">
                <img src={formData.posterUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="createdBy">Club Name (Created By) *</label>
            <input
              type="text"
              id="createdBy"
              name="createdBy"
              className="form-input"
              value={formData.createdBy}
              onChange={handleChange}
              placeholder="e.g., Tech Club, Cultural Committee"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Publishing Event...' : 'Publish Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;