import { useState } from "react";
import "./Register.css";
import API from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined, general: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    else if (formData.name.trim().length < 3) errs.name = "Name must be at least 3 characters";
    else if (formData.name.trim().length > 40) errs.name = "Name must be under 40 characters";

    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Enter a valid email address";

    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^0[97]\d{8}$/.test(formData.phone)) errs.phone = "Use Ethiopian format: 0912345678";

    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8) errs.password = "Minimum 8 characters";
    else if (!/[A-Z]/.test(formData.password)) errs.password = "Include at least one uppercase letter";
    else if (!/\d/.test(formData.password)) errs.password = "Include at least one number";

    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";

    return errs;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    try {
      setLoading(true);
      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister} noValidate>

        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join us and start shopping today</p>
        </div>

        {errors.general && (
          <div className="form-error-banner">{errors.general}</div>
        )}

        <div className="form-field">
          <label htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name" type="text" name="name"
            placeholder="Enter your full name"
            value={formData.name} onChange={handleChange}
            className={errors.name ? "input-error" : ""}
            autoComplete="name"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email" type="email" name="email"
            placeholder="you@example.com"
            value={formData.email} onChange={handleChange}
            className={errors.email ? "input-error" : ""}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="reg-phone">Phone Number</label>
          <input
            id="reg-phone" type="tel" name="phone"
            placeholder="e.g. 0912345678"
            value={formData.phone} onChange={handleChange}
            maxLength="10"
            className={errors.phone ? "input-error" : ""}
            autoComplete="tel"
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="reg-password">Password</label>
          <div className="password-wrap">
            <input
              id="reg-password" type={showPw ? "text" : "password"} name="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={formData.password} onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              autoComplete="new-password"
            />
            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <div className="password-wrap">
            <input
              id="reg-confirm" type={showConfirm ? "text" : "password"} name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword} onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
              autoComplete="new-password"
            />
            <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Hide password" : "Show password"}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="register-submit-btn" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : "Create Account"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

      </form>
    </div>
  );
}

export default Register;
