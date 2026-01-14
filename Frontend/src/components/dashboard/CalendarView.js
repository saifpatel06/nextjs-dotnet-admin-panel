import React, { useState, useEffect } from 'react';
import styles from '../../../styles/Calendar.module.css';

const CalendarView = ({ appointments, onEdit }) => {
  const [viewType, setViewType] = useState('week');
  const [now, setNow] = useState(new Date());
  
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDays = viewType === 'week' ? days : [days[new Date().getDay()]];

  const HOUR_HEIGHT = 100;
  const START_HOUR = hours[0];
  const HEADER_HEIGHT = 50;

  // Update the red line every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Confirmed': return { bg: '#e8f5e9', border: '#2e7d32', color: '#1b5e20' };
      case 'Completed': return { bg: '#e3f2fd', border: '#1565c0', color: '#0d47a1' };
      case 'Cancelled': return { bg: '#ffebee', border: '#c62828', color: '#b71c1c' };
      default: return { bg: '#fffde7', border: '#fbc02d', color: '#f57f17' };
    }
  };

  // Calculate where the red line should be
  const calculateCurrentTimeTop = () => {
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHour < START_HOUR || currentHour >= hours[hours.length - 1] + 1) {
      return null; // Don't show line if outside business hours
    }

    return ((currentHour - START_HOUR) * HOUR_HEIGHT) + ((currentMinutes / 60) * HOUR_HEIGHT) + HEADER_HEIGHT;
  };

  const timeLineTop = calculateCurrentTimeTop();

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <div className="btn-group shadow-sm">
          <button className={`btn btn-sm ${viewType === 'day' ? 'btn-primary' : 'btn-light border'}`} onClick={() => setViewType('day')}>Day</button>
          <button className={`btn btn-sm ${viewType === 'week' ? 'btn-primary' : 'btn-light border'}`} onClick={() => setViewType('week')}>Week</button>
        </div>
        <div className="fw-bold text-secondary">
          {viewType === 'week' ? 'Weekly Schedule' : `Today's Schedule`}
        </div>
      </div>

      <div className={styles.responsiveWrapper} style={{ position: 'relative' }}>
        {/* THE RED LINE INDICATOR */}
        {timeLineTop !== null && (
          <div 
            className={styles.currentTimeLine} 
            style={{ top: `${timeLineTop}px` }}
          >
            <div className={styles.currentTimeCircle}></div>
          </div>
        )}

        <div className={styles.grid} style={{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)` }}>
          
          <div className={styles.dayColumn}>
            <div className={styles.dayHeader} style={{ height: `${HEADER_HEIGHT}px` }}>Time</div>
            {hours.map(h => <div key={h} className={styles.timeLabelCell} style={{ height: `${HOUR_HEIGHT}px` }}>{h}:00</div>)}
          </div>

          {activeDays.map((dayLabel, idx) => {
            const dayIdx = viewType === 'week' ? idx : new Date().getDay();
            const isToday = new Date().getDay() === dayIdx;

            return (
              <div key={dayLabel} className={styles.dayColumn} style={{ position: 'relative' }}>
                <div className={`${styles.dayHeader} ${isToday ? 'text-primary' : ''}`} style={{ height: `${HEADER_HEIGHT}px` }}>
                   {dayLabel}
                </div>
                
                {hours.map(h => (
                  <div key={h} className={styles.slot} style={{ height: `${HOUR_HEIGHT}px` }}></div>
                ))}

                {appointments
                  .filter(a => new Date(a.appointmentDate).getDay() === dayIdx)
                  .map(app => {
                    const date = new Date(app.appointmentDate);
                    const topOffset = ((date.getHours() - START_HOUR) * HOUR_HEIGHT) + ((date.getMinutes() / 60) * HOUR_HEIGHT);
                    const blockHeight = ((app.durationInMinutes || 30) / 60) * HOUR_HEIGHT;
                    const s = getStatusStyles(app.status);

                    return (
                      <div 
                        key={app.id} 
                        className={styles.appointmentBlock} 
                        style={{ 
                          position: 'absolute',
                          top: `${topOffset + HEADER_HEIGHT}px`,
                          height: `${blockHeight - 2}px`, 
                          left: '4px',
                          right: '4px',
                          backgroundColor: s.bg, 
                          borderLeft: `4px solid ${s.border}`,
                          zIndex: 5
                        }}
                        onClick={() => onEdit(app)}
                      >
                        <div className="d-flex flex-column">
                          <span className="fw-bold" style={{fontSize: '0.75rem', color: s.color}}>{app.clientName}</span>
                          <span className="text-muted" style={{fontSize: '0.65rem'}}>{app.serviceName}</span>
                        </div>
                        <div className="fw-bold text-end" style={{fontSize: '0.6rem', color: s.border}}>
                          @{app.barberName}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;