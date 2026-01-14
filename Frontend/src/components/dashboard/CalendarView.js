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

  // DATE NAVIGATION HELPERS
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
    // ONLY show the red line if the selected date is TODAY
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
        <div className="d-flex align-items-center gap-3">
          {/* NAVIGATION BUTTONS */}
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" onClick={handlePrevDay}>←</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleGoToday}>Today</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleNextDay}>→</button>
          </div>

          {/* DATE PICKER */}
          <input 
            type="date" 
            className="form-control form-control-sm border-0 fw-bold bg-transparent" 
            style={{ width: 'auto' }}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        
        <div className="badge bg-primary px-3">
          {selectedDate === new Date().toISOString().split('T')[0] ? 'Live View' : 'Past/Future View'}
        </div>
      </div>

      <div className={styles.responsiveWrapper}>
        <div className={styles.grid} style={{ 
          gridTemplateColumns: `80px repeat(${uniqueBarbers.length || 1}, 1fr)`,
          position: 'relative' 
        }}>
          
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
                  <div className={styles.currentTimeLine} style={{ top: `${timeLineTop}px` }}>
                    <div className={styles.currentTimeCircle}></div>
                  </div>
                )}

                {appointments
                  .filter(a => a.barberName === barber)
                  .map(app => {
                    const date = new Date(app.appointmentDate);
                    const topPos = ((date.getHours() - START_HOUR) * HOUR_HEIGHT) + ((date.getMinutes() / 60) * HOUR_HEIGHT);
                    const blockHeight = ((app.durationInMinutes || 30) / 60) * HOUR_HEIGHT;
                    
                    // Simple status color picker
                    let bgColor = '#fffde7'; 
                    let borderColor = '#fbc02d';
                    if(app.status === 'Confirmed') { bgColor = '#e8f5e9'; borderColor = '#2e7d32'; }
                    if(app.status === 'Cancelled') { bgColor = '#ffebee'; borderColor = '#c62828'; }

                    return (
                      <div 
                        key={app.id} 
                        className={styles.appointmentBlock} 
                        style={{ 
                          top: `${topPos}px`,
                          height: `${blockHeight - 2}px`, 
                          backgroundColor: bgColor, 
                          borderLeft: `4px solid ${borderColor}`
                        }}
                        onClick={() => onEdit(app)}
                      >
                        <div className="d-flex flex-column h-100 justify-content-between">
                          <div className="fw-bold text-truncate" style={{fontSize: '0.8rem'}}>{app.clientName}</div>
                          <div className="text-muted text-truncate" style={{ fontSize: '0.7rem', marginTop: '1px', fontStyle: 'italic' }}>
                            ✂️ {app.serviceName || 'No Service'}
                          </div>
                          <div className="text-end" style={{fontSize: '0.6rem', fontWeight: 'bold'}}>
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )) : (
            <div className="p-5 text-center text-muted w-100">No appointments for this date.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;