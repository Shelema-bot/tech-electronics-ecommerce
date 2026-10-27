import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="not-found">

      <div className="not-found-content">

        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p>
          Sorry, the page you are looking for doesn't exist or may have
          been moved.
        </p>

        <Link to="/" className="not-found-btn">
          Back to Home
        </Link>

      </div>

    </div>
  );
}

export default NotFound;