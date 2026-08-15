import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AdminFooter from "./AdminFooter";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Main area */}
      <div className={`admin-main ${collapsed ? "collapsed" : ""}`}>

        {/* Topbar */}
        <Topbar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        {/* Page content */}
        <div className="admin-body">
          {children}
        </div>

        {/* Footer */}
        <AdminFooter />

      </div>

    </div>
  );
}

export default AdminLayout;
