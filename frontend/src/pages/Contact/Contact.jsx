import { useState } from "react";
import API from "../../api/axios";
import "./Contact.css";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submitMessage = async (e) => {
    e.preventDefault();
    try {
      setSending(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("subject", form.subject);
      formData.append("message", form.message);
      if (screenshot) formData.append("screenshot", screenshot);

      await API.post("/contact", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setScreenshot(null);
      setPreview("");
    } catch (error) {
      console.log(error);
      toast.error("Message failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">

        {/* Info Panel */}
        <div className="contact-info">
          <Link to="/my-messages" className="my-messages-btn">
            📨 My Messages
          </Link>

          <h1>Contact Us</h1>
          <p>Have questions about our products? Feel free to contact us.</p>

          <div className="contact-item">
            <h3>📍 Address</h3>
            <p>Addis Ababa, Ethiopia</p>
          </div>
          <div className="contact-item">
            <h3>📞 Phone</h3>
            <p>+251 974 007 772</p>
          </div>
          <div className="contact-item">
            <h3>✉️ Email</h3>
            <p>shelemaagari@gmail.com</p>
          </div>

          <div className="contact-screenshot-note">
            <span>💡</span>
            <p>Made a payment? You can upload your transaction screenshot below so our team can verify it quickly.</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="contact-form">
          <h2>Send Message</h2>

          {sent ? (
            <div className="contact-success">
              <div className="contact-success-icon">✅</div>
              <h3>Message Sent!</h3>
              <p>We'll get back to you as soon as possible.</p>
              <button
                className="contact-send-another"
                onClick={() => setSent(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={submitMessage}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Your Name"
                required
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Your Email"
                required
              />
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                type="text"
                placeholder="Subject"
                required
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="4"
                required
              />

              {/* Screenshot upload */}
              <div className="screenshot-upload">
                <label className="screenshot-label">
                  📎 Attach Transaction Screenshot (optional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    hidden
                  />
                </label>
                {preview && (
                  <div className="screenshot-preview">
                    <img src={preview} alt="screenshot preview" />
                    <button
                      type="button"
                      className="remove-screenshot"
                      onClick={() => { setScreenshot(null); setPreview(""); }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default Contact;
