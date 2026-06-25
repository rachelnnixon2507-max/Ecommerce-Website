import React, { useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Root wrapper that wires AuthProvider and CartProvider together:
// - CartProvider receives the logged-in userId so each user has
//   their own isolated cart stored under a per-user localStorage key.
// - AuthProvider receives a callback that clears the cart on logout
//   so stale cart data never bleeds between sessions.
function Root() {
  // Track the current userId at the root level so CartProvider can
  // re-initialise whenever the user changes (login / logout).
  const [userId, setUserId] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored)?.id ?? null : null;
    } catch {
      return null;
    }
  });

  // clearCartRef is populated by CartProvider; called during logout.
  const clearCartRef = useRef(null);

  const handleLogin = (userData) => {
    setUserId(userData?.id ?? null);
  };

  const handleLogout = () => {
    if (clearCartRef.current) clearCartRef.current();
    setUserId(null);
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider onLogout={handleLogout} onLogin={handleLogin}>
          <CartProvider userId={userId} clearCartRef={clearCartRef}>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
