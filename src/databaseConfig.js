import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_DB_NAME = 'E_Shopping';
export const ALLOWED_DB_NAMES = ['E_Shopping', 'E_ShopUSA'];
export const DB_STORAGE_KEY = 'ages_store_selected_database';

// Maps the country dropdown value to its corresponding backend database name.
export const COUNTRY_DB_MAP = {
  Ethio: 'E_Shopping',
  USA: 'E_ShopUSA',
};

export const DB_COUNTRY_MAP = {
  E_Shopping: 'Ethio',
  E_ShopUSA: 'USA',
};

export const sanitizeDatabaseName = (name) => {
  if (typeof name !== 'string') {
    return DEFAULT_DB_NAME;
  }

  const trimmed = name.trim();
  return ALLOWED_DB_NAMES.includes(trimmed) ? trimmed : DEFAULT_DB_NAME;
};

export const getDatabaseNameFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem(DB_STORAGE_KEY);
    return sanitizeDatabaseName(stored);
  } catch {
    return DEFAULT_DB_NAME;
  }
};

export const setDatabaseNameInStorage = async (name) => {
  const safe = sanitizeDatabaseName(name);
  try {
    await AsyncStorage.setItem(DB_STORAGE_KEY, safe);
  } catch {
    // Ignore persistence failures and keep runtime state.
  }
  return safe;
};
