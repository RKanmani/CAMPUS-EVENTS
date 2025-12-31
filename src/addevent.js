import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
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

  // 🔥 Convert date + time into Firestore Timestamp
  const getEventStartTimestamp = () => {
    const dateTimeString = `${formData.date}T${formData.startTime}`;
    return Timestamp.fromDate(new Date(dateTimeString));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventStartAt = getEventStartTimestamp();

      await addDoc(collection(db, "events"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        posterUrl: formData.posterUrl,
        createdBy: formData.createdBy,

        // ✅ NEW FIELD (VERY IMPORTANT)
        eventStartAt,

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
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
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
              <label>Sub Category</label>
              <input
                type="text"
                name="subCategory"
                className="form-input"
                value={formData.subCategory}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                name="startTime"
                className="form-input"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                name="endTime"
                className="form-input"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Venue *</label>
            <input
              type="text"
              name="venue"
              className="form-input"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Poster Image URL *</label>
            <input
              type="url"
              name="posterUrl"
              className="form-input"
              value={formData.posterUrl}
              onChange={handleChange}
              required
            />
            {formData.posterUrl && (
              <div className="image-preview">
                <img src={formData.posterUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Club Name *</label>
            <input
              type="text"
              name="createdBy"
              className="form-input"
              value={formData.createdBy}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Publishing Event...' : 'Publish Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
