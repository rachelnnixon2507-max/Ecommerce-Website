import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

const loadStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children, onLogout, onLogin }) {
  const [user, setUser] = useState(loadStoredUser);
  const onLogoutRef = useRef(onLogout);
  const onLoginRef = useRef(onLogin);

  useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);
  useEffect(() => { onLoginRef.current = onLogin; }, [onLogin]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    if (onLoginRef.current) onLoginRef.current(userData);
  };

  const logout = async () => {
    // Clear the user's cart before resetting the user state
    if (onLogoutRef.current) onLogoutRef.current();
    try {
      await api.post("/api/Auth/logout");
    } catch {
      // Cookie will expire naturally; ignore network errors
    }
    setUser(null);
  };

  const isAdmin = () => user?.role === "Admin";
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
