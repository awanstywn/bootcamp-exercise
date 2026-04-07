import { useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

/**
 * Objective: Automatically logs out users after a period of inactivity.
 * 
 * Monitors standard user interactions (mouse movement, clicks, keypresses, scrolling). 
 * If a monitored event is detected, the inactivity timer resets. Otherwise, if the user remains 
 * idle for the defined `timeoutMinutes`, the global `logout` action is triggered to secure the session.
 * 
 * @param timeoutMinutes - Inactivity threshold in minutes (default is 5).
 */
export const useIdleTimer = (timeoutMinutes = 5) => {
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout(); 
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn, logout, timeoutMinutes]);
};
