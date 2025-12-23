import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Import our beautiful CSS

const MyEvents = () => {
  const { user } = useContext(AuthContext);
  const [myEvents, setMyEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Listen to user's registrations
    const q = query(collection(db, "registrations"), where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const eventPromises = snapshot.docs.map(async (regDoc) => {
        const eventId = regDoc.data().eventId;
        const eventSnap = await getDoc(doc(db, "events", eventId));
        return { id: eventId, ...eventSnap.data(), regType: regDoc.data().type };
      });

      const results = await Promise.all(eventPromises);
      
      // 2. CHRONOLOGICAL SORTING (Earliest first)
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMyEvents(results);
    });

    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>📅 My Registered Events</h2>
      
      {myEvents.length === 0 ? (
        <p>No events joined yet, bruh. Go explore!</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {myEvents.map(event => (
            <div 
              key={event.id} 
              className="glass-panel" 
              style={{ display: 'flex', padding: '20px', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <img src={event.posterUrl} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', marginRight: '20px' }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{event.title}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>{event.date} at {event.startTime}</p>
              </div>
              <div style={{ 
                padding: '5px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                background: event.regType === 'Going' ? '#dcfce7' : '#fef9c3',
                color: event.regType === 'Going' ? '#166534' : '#854d0e'
              }}>
                {event.regType}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;