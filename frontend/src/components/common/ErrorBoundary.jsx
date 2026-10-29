import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          minHeight: "360px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
          background: "#f8fafc",
          borderRadius: "16px",
          margin: "24px auto",
          maxWidth: "700px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚡</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
            Something went wrong while rendering this section
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "520px", marginBottom: "20px", lineHeight: 1.5 }}>
            {this.state.error?.message || "An unexpected error occurred. Please click reload to refresh."}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: "10px 22px",
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
              }}
            >
              🔄 Reload Section
            </button>
            <a
              href="/"
              style={{
                padding: "10px 20px",
                background: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              🏠 Go to Storefront
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
