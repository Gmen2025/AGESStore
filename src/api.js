// API layer — connected to the production backend shared by customer/driver/store apps.
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  'https://easy-shop-server-wldr.onrender.com/api/v1'
).replace(/\/+$/, '');
const TOKEN_KEY = 'ages_token';

export async function getToken() {
  try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export async function setToken(token) {
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Network error — check your connection.');
  }

  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Auth (public)
  registerStore: (payload) =>
    request('/stores/register-owner', { method: 'POST', body: payload, auth: false }),
  login: (email, password) =>
    request('/users/store-owner-login', { method: 'POST', body: { email, password }, auth: false }),
  getMyStore: () => request('/stores/mine/by-owner'),

  // Dashboard & analytics
  getDashboard: (storeId) => request(`/stores/${storeId}/dashboard`),
  getSalesAnalysis: (storeId, range) => request(`/stores/${storeId}/sales?range=${encodeURIComponent(range)}`),
  getTopProducts: (storeId) => request(`/stores/${storeId}/top-products`),

  // Products & inventory
  getProducts: (storeId) => request(`/stores/${storeId}/products`),
  createProduct: (storeId, payload) => request(`/stores/${storeId}/products`, { method: 'POST', body: payload }),
  updateProduct: (storeId, productId, payload) => request(`/stores/${storeId}/products/${productId}`, { method: 'PUT', body: payload }),
  adjustStock: (storeId, productId, payload) => request(`/stores/${storeId}/products/${productId}/stock`, { method: 'POST', body: payload }),

  // Orders
  getOrders: (storeId) => request(`/stores/${storeId}/orders`),
  updateOrderStatus: (storeId, orderId, status) => request(`/stores/${storeId}/orders/${orderId}`, { method: 'PATCH', body: { status } }),

  // Reviews
  getReviews: (storeId) => request(`/stores/${storeId}/reviews`),

  // Earnings & payouts
  getEarnings: (storeId) => request(`/stores/${storeId}/earnings`),
  requestPayout: (storeId, payload) => request(`/stores/${storeId}/payouts`, { method: 'POST', body: payload }),
};
