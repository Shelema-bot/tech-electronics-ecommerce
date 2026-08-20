import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountSidebar from "../AccountSidebar/AccountSidebar";
import "../AccountSidebar/AccountSidebar.css";

function AccountLayout({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      const saved = localStorage.getItem("user");
      if (!saved) { navigate("/login"); return; }
      setUser(JSON.parse(saved));
    };
    loadUser();
    window.addEventListener("loginStatusChanged", loadUser);
    return () => window.removeEventListener("loginStatusChanged", loadUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="account-page-layout">
      <AccountSidebar user={user} />
      <div className="account-page-content">
        {children}
      </div>
    </div>
  );
}

export default AccountLayout;
