import React from 'react';

const Event = ({ event }) => {
  return (
    <div className="post-event">
      <h2 style={{ opacity: '0.6' }}>EVENT</h2>
      <h1 style={{ fontWeight: 'bold' }}>{event.name}</h1>
      <div className="event-info">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
          <path d="M12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm4,13h-4c-.552,0-1-.447-1-1V6c0-.553,.448-1,1-1s1,.447,1,1v5h3c.553,0,1,.447,1,1s-.447,1-1,1Z" />
        </svg>
        <span>{event.time}</span>
      </div>
      <div className="event-info">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
          <path d="M0,19a5.006,5.006,0,0,0,5,5H19a5.006,5.006,0,0,0,5-5V10H0Zm17-4.5A1.5,1.5,0,1,1,15.5,16,1.5,1.5,0,0,1,17,14.5Zm-5,0A1.5,1.5,0,1,1,10.5,16,1.5,1.5,0,0,1,12,14.5Zm-5,0A1.5,1.5,0,1,1,5.5,16,1.5,1.5,0,0,1,7,14.5Z" />
          <path d="M19,2H18V1a1,1,0,0,0-2,0V2H8V1A1,1,0,0,0,6,1V2H5A5.006,5.006,0,0,0,0,7V8H24V7A5.006,5.006,0,0,0,19,2Z" />
        </svg>
        <span>{event.date}</span>
      </div>
      <div className="event-info">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
          <path d="M12,0A10.011,10.011,0,0,0,2,10c0,5.282,8.4,12.533,9.354,13.343l.646.546.646-.546C13.6,22.533,22,15.282,22,10A10.011,10.011,0,0,0,12,0Zm0,15a5,5,0,1,1,5-5A5.006,5.006,0,0,1,12,15Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <a target="_blank" href={event.location.link} className="event-link">
          {event.location.name}
        </a>
      </div>
    </div>
  );
};

export default Event;
