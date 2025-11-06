import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.id,
          username: payload.username,
          email: payload.email,
        });
      }
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, username, password }) => {
    const response = await api.post("/auth/login", {
      email,
      username,
      password,
    });
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    setUser(userData);

    return response.data;
  };

  const register = async ({
    username,
    email,
    password,
    firstName,
    lastName,
  }) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
      fullName: { firstName, lastName },
    });

    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    setUser(userData);

    return response.data;
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch {
     
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
