import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

const Calendar = () => {
  const { tasks } = useData();

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeSelectedDayTasks, setActiveSelectedDayTasks] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper date calculators
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay(); // 0 is Sunday, 1 is Monday...

  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Compile calendar cells matrix
  const calendarCells = [];
  
  // Previous month padding days
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      dateString: null
    });
  }

  // Active month days
  for (let i = 1; i <= totalDays; i++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(i).padStart(2, '0');
    calendarCells.push({
      dayNum: i,
      isCurrentMonth: true,
      dateString: `${year}-${formattedMonth}-${formattedDay}`
    });
  }

  // Next month padding days to complete grid cells (multiples of 7)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      dayNum: i,
      isCurrentMonth: false,
      dateString: null
    });
  }

  // Find due tasks mapping to specific dates
  const getTasksForDate = (dateStr) => {
    if (!dateStr) return [];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const handleCellClick = (cell) => {
    if (!cell.dateString) return;
    const cellTasks = getTasksForDate(cell.dateString);
    if (cellTasks.length > 0) {
      setActiveSelectedDayTasks({
        date: cell.dateString,
        tasks: cellTasks
      });
    }
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="card-panel">
      
      {/* Calendar Navigation header */}
      <div className="panel-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={20} style={{ color: 'var(--primary)' }} />
          <span>Interactive Calendar</span>
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-icon" onClick={prevMonth} style={{ width: '32px', height: '32px' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: '700', minWidth: '130px', textAlign: 'center', fontFamily: 'var(--font-header)' }}>
            {monthNames[month]} {year}
          </span>
          <button className="btn btn-secondary btn-icon" onClick={nextMonth} style={{ width: '32px', height: '32px' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        
        {/* Days of week titles */}
        <div className="calendar-grid" style={{ marginBottom: '4px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
        </div>

        {/* Days cells blocks */}
        <div className="calendar-grid">
          {calendarCells.map((cell, idx) => {
            const cellTasks = getTasksForDate(cell.dateString);
            const todayClass = isToday(cell.dateString) ? 'today' : '';
            const mutedClass = !cell.isCurrentMonth ? 'muted' : '';

            return (
              <div 
                key={idx} 
                className={`calendar-cell ${todayClass} ${mutedClass}`}
                onClick={() => handleCellClick(cell)}
                style={{ cursor: cellTasks.length > 0 ? 'pointer' : 'default' }}
              >
                <div className="calendar-cell-num">{cell.dayNum}</div>
                
                {/* Event tags list */}
                <div className="calendar-cell-events">
                  {cellTasks.slice(0, 2).map(task => (
                    <div 
                      key={task.id} 
                      className="calendar-event-pill"
                      style={{
                        backgroundColor: task.priority === 'High' ? 'var(--priority-high-bg)' :
                                         task.priority === 'Medium' ? 'var(--priority-medium-bg)' : 'var(--priority-low-bg)',
                        color: task.priority === 'High' ? 'var(--priority-high)' :
                               task.priority === 'Medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
                      }}
                    >
                      {task.name}
                    </div>
                  ))}
                  {cellTasks.length > 2 && (
                    <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'center' }}>
                      + {cellTasks.length - 2} more tasks
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* DATES EVENT LOG DIALOG OVERLAY */}
      {activeSelectedDayTasks && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '460px', width: '90%' }}>
            
            <div className="dialog-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: 'var(--primary)' }} />
                  <span>Tasks Due Checklist</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Scheduled Deadlines: <b>{activeSelectedDayTasks.date}</b>
                </p>
              </div>
              <button className="dialog-close" onClick={() => setActiveSelectedDayTasks(null)}>
                <X size={20} />
              </button>
            </div>

            {/* List of due items in overlay */}
            <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeSelectedDayTasks.tasks.map(t => (
                <div 
                  key={t.id} 
                  style={{ 
                    backgroundColor: 'var(--surface-hover)', 
                    border: '1px solid var(--border)', 
                    padding: '12px', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '700' }}>{t.name}</span>
                    <span className={`badge badge-${t.priority.toLowerCase()}`} style={{ fontSize: '9px', padding: '1px 5px' }}>{t.priority}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--primary)' }}>Project: {t.Project?.name}</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Status: <b>{t.status}</b></span>
                </div>
              ))}
            </div>

            <div className="dialog-footer">
              <button className="btn btn-secondary" onClick={() => setActiveSelectedDayTasks(null)}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Calendar;
