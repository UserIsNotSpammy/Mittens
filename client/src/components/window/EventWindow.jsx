import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import MapComponent from '../../APIs/MapComponenet';

const EventWindow = ({ second_time_display, post, onClose, setEvent }) => {
  const [errors, setErrors] = useState([]);
  const [isEventLoading, setIsEventLoading] = useState(false);
  const [eventNameInput, setEventNameInput] = useState('');
  const [eventDateTimeInput, setEventDateTimeInput] = useState('');
  const [eventLocation, setEventLocation] = useState({ name: '', lat: null, lng: null, link: '' }); // Hold location data

  const eventRef = useRef({ name: '', location: eventLocation, date: '', time: '' });
  const windowRef = useRef();
  const postRef = useRef();
  const postTimeout = useRef();

  function addEvent() {
    // Reset errors
    setErrors([]);

    // Validation array
    const validationErrors = [];

    // Validate that every field is not empty
    if (!eventNameInput) {
      validationErrors.push('Event Name is required.');
    }
    if (!eventDateTimeInput) {
      validationErrors.push('Event Date & Time is required.');
    }
    if (!eventLocation.name || eventLocation.lat === null || eventLocation.lng === null) {
      validationErrors.push('Valid Event Location is required.');
    }

    // Check if the date is in the future
    const eventDateTime = new Date(eventDateTimeInput);
    if (eventDateTime <= new Date()) {
      validationErrors.push('Event Date & Time must be in the future.');
    }

    // If there are errors, update the state
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // If validation passes, set the event
    eventRef.current = {
      name: eventNameInput,
      location: eventLocation,
      date: eventDateTime.toISOString().split('T')[0], // format date
      time: eventDateTime.toTimeString().split(' ')[0], // format time
    };

    // Set the event and close the window
    setEvent(eventRef.current);
    onClose();
  }

  useEffect(() => {
    setEventNameInput('');
    setEventDateTimeInput('');
    setEventLocation({ name: '', lat: null, lng: null, link: '' }); // Reset location
    eventRef.current = { name: '', location: eventLocation, date: '', time: '' };
  }, [second_time_display]);

  function closeCheck(e) {
    if (e.target !== windowRef.current && !windowRef.current.contains(e.target) && !isEventLoading) {
      onClose();
    }
  }

  function handleDateTimeInput(e) {
    setEventDateTimeInput(e.target.value);
  }

  function handleEventNameInput(e) {
    setEventNameInput(e.target.value);
  }

  return ReactDOM.createPortal(
    <div className="window-outer-container" onMouseDown={closeCheck}>
      <div className="side-block window" ref={windowRef}>
        <button
          className="close-window-icon"
          onClick={() => {
            onClose();
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
          </svg>
        </button>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '600', height: 'fit-content' }}>Add New Event</h2>
        <div style={{ width: '100%' }}>
          <div className="uniqueField-parent required">
            <span className="uniqueField-title">Event Name</span>
            <input value={eventNameInput} onChange={handleEventNameInput} className="uniqueField" type="text" id="eventNameInput" required />
          </div>
          <div className="uniqueField-parent required">
            <span className="uniqueField-title">Event Date & Time</span>
            <input value={eventDateTimeInput} onChange={handleDateTimeInput} className="uniqueField" type="datetime-local" id="eventDateInput" required />
          </div>
          <div className="uniqueField-parent required">
            <span className="uniqueField-title">Event Location</span>
            <MapComponent
              displayed={second_time_display}
              windowContainer={windowRef}
              postButton={postRef}
              onLocationChange={(location) => {
                setEventLocation(location);
                eventRef.current.location = location;
              }}
            />
          </div>
        </div>
        {errors.length > 0 && (
          <div id="errorsBox" style={{ display: errors.length > 0 ? 'block' : 'none' }}>
            <div className="error-message">
              <span>Please fix the following problem(s):</span>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="sure-buttons-container" style={{ marginTop: '1rem' }}>
          <button
            style={{ fontSize: '14px', width: '100px' }}
            className="generic-button danger-button"
            onClick={() => {
              onClose();
            }}>
            Cancel
          </button>
          <button style={{ fontSize: '14px', width: '100px' }} className="generic-button" onClick={addEvent}>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EventWindow;
