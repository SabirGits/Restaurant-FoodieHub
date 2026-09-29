import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
const AdminAuthContext = createContext(void 0);
const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("smart_restaurant_token"));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_restaurant_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem("smart_restaurant_admin_user", JSON.stringify(res.user));
        } else {
          logout();
        }
      } catch (e) {
        if (e.message?.includes("Authorization") || e.message?.includes("expired")) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, [token]);
  const login = async (email, pass) => {
    try {
      const res = await api.login(email, pass);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("smart_restaurant_token", res.token);
        localStorage.setItem("smart_restaurant_admin_user", JSON.stringify(res.user));
        return true;
      }
      return false;
    } catch (e) {
      throw e;
    }
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("smart_restaurant_token");
    localStorage.removeItem("smart_restaurant_admin_user");
  };
  return <AdminAuthContext.Provider
    value={{
      token,
      user,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout
    }}
  >
      {children}
    </AdminAuthContext.Provider>;
};
const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
};
export {
  AdminAuthProvider,
  useAdminAuth
};
