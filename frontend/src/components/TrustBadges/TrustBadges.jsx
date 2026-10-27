import { useTranslation } from "react-i18next";
import "./TrustBadges.css";

const BADGE_KEYS = [
  { icon: "🚚", titleKey: "trust.shipping",  descKey: "trust.shippingDesc"  },
  { icon: "🔒", titleKey: "trust.payment",   descKey: "trust.paymentDesc"   },
  { icon: "🔄", titleKey: "trust.returns",   descKey: "trust.returnsDesc"   },
  { icon: "💬", titleKey: "trust.support",   descKey: "trust.supportDesc"   },
];

// Fallback text when translation key doesn't exist
const BADGE_FALLBACKS = [
  { title: "Free Shipping",  desc: "On orders over ETB 5,000" },
  { title: "Secure Payment", desc: "100% secure payment"      },
  { title: "30-Day Returns", desc: "Money back guarantee"      },
  { title: "24/7 Support",   desc: "Dedicated support team"   },
];

function TrustBadges() {
  const { t } = useTranslation();

  return (
    <div className="trust-bar">
      {BADGE_KEYS.map((b, i) => (
        <div className="trust-badge" key={i}>
          <span className="trust-icon">{b.icon}</span>
          <div>
            <p className="trust-title">
              {t(b.titleKey, BADGE_FALLBACKS[i].title)}
            </p>
            <p className="trust-desc">
              {t(b.descKey, BADGE_FALLBACKS[i].desc)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrustBadges;
