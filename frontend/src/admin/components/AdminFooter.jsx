import "./AdminFooter.css";

function AdminFooter() {
  return (
    <footer className="admin-footer">
      <span>© {new Date().getFullYear()} Tech &amp; Electronic — Admin Panel</span>
      <span className="admin-footer-right">v1.0.0</span>
    </footer>
  );
}

export default AdminFooter;
