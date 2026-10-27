import { useState } from "react";
import "./ForgotPassword.css";
import API from "../../api/axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);
      const response = await API.post("/auth/forgot-password", { email });
      setMessage(response.data.message + (response.data.resetToken ? "\nToken: " + response.data.resetToken : ""));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h1>{t("auth.forgotPassword", "Forgot Password")}</h1>
        <p>{t("auth.sendResetLink", "Enter your email to reset your password")}</p>

        <form onSubmit={submitHandler}>
          <input
            type="email"
            placeholder={t("auth.email", "Enter your email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? t("auth.sending", "Sending...") : t("auth.resetPassword", "Reset Password")}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <Link to="/login">{t("auth.backToLogin", "Back to Login")}</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
