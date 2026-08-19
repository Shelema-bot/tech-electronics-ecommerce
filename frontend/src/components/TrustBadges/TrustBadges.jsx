import "./TrustBadges.css";

const badges = [
  { icon: "🚚", title: "Free Shipping", desc: "On orders over ETB 5,000" },
  { icon: "🔒", title: "Secure Payment", desc: "100% secure payment" },
  { icon: "🔄", title: "30-Day Returns", desc: "Money back guarantee" },
  { icon: "💬", title: "24/7 Support", desc: "Dedicated support team" },
];

function TrustBadges() {
  return (
    <div className="trust-bar">
      {badges.map((b, i) => (
        <div className="trust-badge" key={i}>
          <span className="trust-icon">{b.icon}</span>
          <div>
            <p className="trust-title">{b.title}</p>
            <p className="trust-desc">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrustBadges;
