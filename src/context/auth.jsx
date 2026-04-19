
// src/context/auth.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const onStorage = () => setIsAuthenticated(!!localStorage.getItem('token'));
    const onLogout = () => setIsAuthenticated(!!localStorage.getItem('token'));

    window.addEventListener('storage', onStorage);
    window.addEventListener('logout', onLogout);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('logout', onLogout);
    };
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('storage')); // إخطار تبويبات أخرى
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('logout')); // إخطار same-tab
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
