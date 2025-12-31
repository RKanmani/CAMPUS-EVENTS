import React, { useEffect, useState, useContext } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { db } from "./firebase";
import { AuthContext } from "./AuthContext";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./MyCalendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MyCalendar = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchRegisteredEvents = async () => {
      const q = query(
        collection(db, "registrations"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const calendarEvents = snapshot.docs.map((doc) => {
        const data = doc.data();

        const start = new Date(`${data.date}T${data.startTime}`);
        const end = new Date(`${data.date}T${data.endTime}`);

        return {
          title: data.eventTitle,
          start,
          end,
          location: data.venue,
        };
      });

      setEvents(calendarEvents);
    };

    fetchRegisteredEvents();
  }, [user]);

  return (
    <div className="calendar-page">
      <h2>📅 My Registered Events</h2>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 550 }}
        views={["month", "week", "day"]}
        popup
      />
    </div>
  );
};

export default MyCalendar;
