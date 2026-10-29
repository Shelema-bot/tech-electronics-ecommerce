import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Team route redirected to About page:
 * The platform was designed and developed entirely by Shelema Ageri (Full-Stack Engineer).
 */
export default function Team() {
  return <Navigate to="/about" replace />;
}
