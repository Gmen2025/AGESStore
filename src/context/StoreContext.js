import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken } from '../api';
import { demoDashboard } from '../data/demoData';

const StoreContext = createContext(null);

// Backend field names for the store document can vary (e.g. nested location/hours objects).
// This maps the possible shapes onto the flat fields the profile screen reads.
function normalizeStore(store) {
  if (!store) return {};
  const coords = store.location?.coordinates; // GeoJSON: [lng, lat]
  return {
    ...store,
    address: store.address ?? store.storeAddress ?? store.location?.address,
    city: store.city ?? store.location?.city,
    country: store.country ?? store.location?.country,
    category: store.category ?? store.businessCategory,
    description: store.description ?? store.about ?? store.bio,
    bankAccount: store.bankAccount ?? store.payoutAccount ?? store.bank?.account,
    openHour: store.openHour ?? store.businessHours?.open ?? store.openingHours?.open,
    closeHour: store.closeHour ?? store.businessHours?.close ?? store.openingHours?.close,
    latitude: store.latitude ?? store.location?.latitude ?? (Array.isArray(coords) ? coords[1] : undefined),
    longitude: store.longitude ?? store.location?.longitude ?? (Array.isArray(coords) ? coords[0] : undefined),
  };
}

export function StoreProvider({ children }) {
  const [owner, setOwner] = useState(null);       // logged-in store owner
  const [dashboard, setDashboard] = useState(demoDashboard);
  const [loading, setLoading] = useState(true);
  const [dbVersion, setDbVersion] = useState(0);   // bumped whenever the active database changes
  const bumpDb = () => setDbVersion((v) => v + 1);

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
    const result = await api.registerStore(form);
    // result: { success, token, owner: {...} }
    await setToken(result?.token);
    const newOwner = {
      ...(result?.owner || {}),
      // keep the registration fields locally for the profile screen
      ...form,
      id: result?.owner?.id,
      storeId: result?.owner?.storeId,
      storeName: result?.owner?.storeName || form.storeName,
      fullName: result?.owner?.fullName || form.fullName,
      email: result?.owner?.email || form.email,
    };
    setOwner(newOwner);
    await persist(newOwner);
    return newOwner;
  };

  const login = async (email, password) => {
    const result = await api.login(email, password);
    // result: { _id, name, email, phone, token, ... }
    await setToken(result?.token);

    // Resolve the owner's store (id, profile fields) from the backend.
    let store = null;
    try {
      const mine = await api.getMyStore();
      store = mine?.store || null;
      if (__DEV__) console.log('getMyStore raw response:', JSON.stringify(store));
    } catch { /* no store yet */ }

    const loggedIn = {
      id: result?._id || result?.id,
      storeId: store?.id || null,
      fullName: result?.name,
      storeName: store?.name || 'My Store',
      email: result?.email || email,
      phone: result?.phone,
      ...normalizeStore(store),
    };
    setOwner(loggedIn);
    await persist(loggedIn);
    return loggedIn;
  };

  const logout = async () => {
    setOwner(null);
    await setToken(null);
    await persist(null);
  };

  const updateProfile = async (form) => {
    const result = await api.updateMyStore(form);
    const updated = {
      ...owner,
      ...normalizeStore(result?.store || form),
    };
    setOwner(updated);
    await persist(updated);
    return updated;
  };

  return (
    <StoreContext.Provider value={{ owner, dashboard, setDashboard, loading, register, login, logout, updateProfile, dbVersion, bumpDb }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
