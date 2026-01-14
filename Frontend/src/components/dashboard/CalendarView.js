import React, { useState, useEffect } from 'react';
import styles from '../../../styles/Calendar.module.css';

const CalendarView = ({ appointments, onEdit, selectedDate, onDateChange }) => {
  const [now, setNow] = useState(new Date());
  
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const HOUR_HEIGHT = 100;
  const START_HOUR = hours[0];
  const HEADER_HEIGHT = 50;

  const uniqueBarbers = [...new Set(appointments.map(a => a.barberName))].sort();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleGoToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const calculateCurrentTimeTop = () => {
    const isToday = new Date().toISOString().split('T')[0] === selectedDate;
    if (!isToday) return null;

    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    if (currentHour < START_HOUR || currentHour >= hours[hours.length - 1] + 1) return null;
    return ((currentHour - START_HOUR) * HOUR_HEIGHT) + ((currentMinutes / 60) * HOUR_HEIGHT);
  };

  const timeLineTop = calculateCurrentTimeTop();

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <div className={styles.navControls}>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" onClick={handlePrevDay}>←</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleGoToday}>Today</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleNextDay}>→</button>
          </div>

          <input 
            type="date" 
            className={styles.dateInput} 
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        
        <div className="badge bg-primary px-3">
          {selectedDate === new Date().toISOString().split('T')[0] ? 'Live View' : 'Past/Future View'}
        </div>
      </div>

      <div className={styles.responsiveWrapper}>
        <div 
          className={styles.grid} 
          style={{ '--barber-count': uniqueBarbers.length || 1 }}
        >
          {/* Time Gutter */}
          <div className={styles.dayColumn}>
            <div className={styles.dayHeader} style={{ height: `${HEADER_HEIGHT}px` }}>Time</div>
            <div className={styles.columnBody}>
              {hours.map(h => (
                <div key={h} className={styles.timeLabelCell} style={{ height: `${HOUR_HEIGHT}px` }}>
                  {h}:00
                </div>
              ))}
            </div>
          </div>

          {/* Barber Columns */}
          {uniqueBarbers.length > 0 ? uniqueBarbers.map((barber) => (
            <div key={barber} className={styles.dayColumn}>
              <div className={styles.dayHeader} style={{ height: `${HEADER_HEIGHT}px` }}>
                {barber}
              </div>
              
              <div className={styles.columnBody}>
                {hours.map(h => (
                  <div key={h} className={styles.slot} style={{ height: `${HOUR_HEIGHT}px` }}></div>
                ))}

                {timeLineTop !== null && (
                  <div className={styles.currentTimeLine} style={{ '--line-top': `${timeLineTop}px` }}>
                    <div className={styles.currentTimeCircle}></div>
                  </div>
                )}

                {appointments
                  .filter(a => a.barberName === barber)
                  .map(app => {
                    const date = new Date(app.appointmentDate);
                    const topPos = ((date.getHours() - START_HOUR) * HOUR_HEIGHT) + ((date.getMinutes() / 60) * HOUR_HEIGHT);
                    const blockHeight = ((app.durationInMinutes || 30) / 60) * HOUR_HEIGHT;
                    
                    // Logic for status class
                    const statusClass = styles[`status${app.status}`] || styles.statusPending;

                    return (
                      <div 
                        key={app.id} 
                        className={`${styles.appointmentBlock} ${statusClass}`}
                        style={{ 
                          '--top-pos': `${topPos}px`,
                          '--block-height': `${blockHeight - 2}px` 
                        }}
                        onClick={() => onEdit(app)}
                      >
                        <div className={styles.appointmentContent}>
                          <div className={styles.clientServiceInfo}>
                            <span className={styles.clientName}>{app.clientName}</span>
                            <span className={styles.serviceName}> — {app.serviceName || 'No Service'}</span>
                          </div>
                          <div className={styles.appointmentTime}>
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )) : (
            <div className={styles.emptyState}>No appointments for this date.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;