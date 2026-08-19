import { useState } from "react";
import "./AnnouncementBar.css";

function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="announcement-bar">
      <span className="ann-text">
        🚚 <strong>Free Shipping</strong> on all orders over ETB 5,000! &nbsp;|&nbsp;
        🔒 <strong>100% Secure</strong> Payment &nbsp;|&nbsp;
        📞 Support: <strong>+251 974 007 772</strong>
      </span>
      <button className="ann-close" onClick={() => setVisible(false)} aria-label="Close">✕</button>
    </div>
  );
}

export default AnnouncementBar;
