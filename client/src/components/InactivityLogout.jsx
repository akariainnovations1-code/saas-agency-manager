import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const InactivityLogout = ({ children }) => {
  const { user, logout } = useAuth();
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // 15 minutes of inactivity: 15 * 60 * 1000 = 900000 milliseconds
    timerRef.current = setTimeout(() => {
      if (user) {
        logout();
        alert('Your session has expired due to inactivity. Please sign in again to continue.');
      }
    }, 15 * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Initialize inactivity tracker
    resetTimer();

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  return <>{children}</>;
};

export default InactivityLogout;
