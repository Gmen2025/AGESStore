import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { demoOwner, demoDashboard } from '../data/demoData';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [owner, setOwner] = useState(null);       // logged-in store owner
  const [dashboard, setDashboard] = useState(demoDashboard);
  const [loading, setLoading] = useState(true);

  // Restore persisted session on launch
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('ages_owner');
        if (raw) setOwner(JSON.parse(raw));
      } catch (e) {
        console.warn('restore session failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (value) => {
    try {
      if (value) await AsyncStorage.setItem('ages_owner', JSON.stringify(value));
      else await AsyncStorage.removeItem('ages_owner');
    } catch (e) {
      console.warn('persist session failed', e);
    }
  };

  const register = async (form) => {
    const newOwner = { ...demoOwner, ...form, id: `owner-${Date.now()}` };
    setOwner(newOwner);
    await persist(newOwner);
    return newOwner;
  };

  const login = async (email, password) => {
    const loggedIn = { ...demoOwner, email };
    setOwner(loggedIn);
    await persist(loggedIn);
    return loggedIn;
  };

  const logout = async () => {
    setOwner(null);
    await persist(null);
  };

  return (
    <StoreContext.Provider value={{ owner, dashboard, setDashboard, loading, register, login, logout }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
