import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { CartProvider }         from "./context/CartContext.jsx";
import { WishlistProvider }     from "./context/WishlistContext.jsx";
import { ToastProvider }        from "./context/ToastContext.jsx";
import { PreferenceProvider }   from "./context/PreferenceContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PreferenceProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </PreferenceProvider>
  </StrictMode>
);
