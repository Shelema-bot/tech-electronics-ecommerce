import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../api/axios";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setNotifications([]); setUnreadCount(0); return; }
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // not logged in or error — silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60000);
    window.addEventListener("loginStatusChanged", fetchNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener("loginStatusChanged", fetchNotifications);
    };
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      const n = notifications.find(x => x._id === id);
      setNotifications(prev => prev.filter(x => x._id !== id));
      if (n && !n.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead, deleteNotif }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
