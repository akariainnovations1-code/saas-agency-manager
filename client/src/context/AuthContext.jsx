import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('saas_jwt_token');
      if (token) {
        try {
          const profile = await api('/auth/me');
          if (profile) {
            setUser(profile);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      
      if (data) {
        if (data.twoFactorRequired || data.mustChangePassword) {
          return data; // Return full response to handle state transitions in the UI
        }
        
        if (data.token) {
          localStorage.setItem('saas_jwt_token', data.token);
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            avatar: data.avatar
          });
          return { success: true };
        }
      }
      return { success: false };
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (userId, code) => {
    try {
      const data = await api('/auth/2fa/verify', {
        method: 'POST',
        body: { userId, code }
      });
      
      if (data && data.token) {
        localStorage.setItem('saas_jwt_token', data.token);
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar
        });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      throw error;
    }
  };

  const changePasswordForce = async (email, tempToken, newPassword) => {
    try {
      const data = await api('/auth/change-password-force', {
        method: 'POST',
        body: { email, tempToken, newPassword }
      });
      
      if (data && data.token) {
        localStorage.setItem('saas_jwt_token', data.token);
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar
        });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: { name, email, password, role }
      });
      if (data && data.token) {
        localStorage.setItem('saas_jwt_token', data.token);
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar
        });
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('saas_jwt_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, verify2FA, changePasswordForce }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
