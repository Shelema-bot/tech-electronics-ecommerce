import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../api/axios";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // not logged in or error — silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      fetchNotifications();
    }
    // Poll every 60 seconds for new notifications only if user is logged in
    const interval = setInterval(() => {
      const t = localStorage.getItem("token");
      if (t && t !== "undefined" && t !== "null") {
        fetchNotifications();
      }
    }, 60000);

    const handleAuthChange = () => {
      const t = localStorage.getItem("token");
      if (t && t !== "undefined" && t !== "null") {
        fetchNotifications();
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    window.addEventListener("loginStatusChanged", handleAuthChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("loginStatusChanged", handleAuthChange);
    };
  }, [fetchNotifications]);

  const markRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;
    try {
      await API.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;
    try {
      await API.patch("/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;
    try {
      await API.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const n = notifications.find(x => x._id === id);
      setNotifications(prev => prev.filter(x => x._id !== id));
      if (n && !n.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const clearAll = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;
    try {
      await API.delete("/notifications/clear-all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead, deleteNotif, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
