// Demo data so the app runs fully offline before the backend is connected.

export const demoOwner = {
  id: 'owner-1',
  fullName: 'Demo Owner',
  storeName: 'AGES Market',
  email: 'owner@ages.com',
};

export const demoDashboard = {
  todaySales: 1245,
  monthlySales: 18430,
  totalOrders: 126,
  totalProducts: 348,
  lowStock: 14,
  outOfStock: 5,
  pendingOrders: 12,
  avgRating: 4.7,
  availableBalance: 8420,
  pendingPayout: 1250,
};

export const demoSales = {
  Today: { gross: 1245, discounts: 60, refunds: 25, commission: 62, net: 1098, orders: 18, avgOrder: 69 },
  '7 Days': { gross: 8120, discounts: 410, refunds: 120, commission: 406, net: 7184, orders: 112, avgOrder: 73 },
  '30 Days': { gross: 27800, discounts: 1100, refunds: 500, commission: 770, net: 25430, orders: 356, avgOrder: 78 },
  '3 Months': { gross: 76400, discounts: 3200, refunds: 1400, commission: 2100, net: 69700, orders: 980, avgOrder: 78 },
  '1 Year': { gross: 294500, discounts: 12100, refunds: 5600, commission: 8400, net: 268400, orders: 3710, avgOrder: 79 },
};

export const demoTopProducts = [
  { id: 't1', name: 'Nido Milk', sold: 428 },
  { id: 't2', name: 'Coconut Oil', sold: 317 },
  { id: 't3', name: 'Baby Lotion', sold: 281 },
  { id: 't4', name: 'Shampoo', sold: 195 },
  { id: 't5', name: 'Vitamins', sold: 174 },
];

export const demoProducts = [
  { id: 'p1', name: 'Nido Milk', price: 25, stock: 42, sold: 158, minStock: 10, category: 'Dairy' },
  { id: 'p2', name: 'Lotion', price: 12, stock: 8, sold: 91, minStock: 10, category: 'Care' },
  { id: 'p3', name: 'Shampoo', price: 9, stock: 0, sold: 73, minStock: 10, category: 'Care' },
  { id: 'p4', name: 'Coconut Oil', price: 14, stock: 35, sold: 120, minStock: 8, category: 'Grocery' },
];

export const demoOrders = [
  {
    id: '10251', customer: 'Ahmed', total: 125, time: '10:24 AM', status: 'Pending',
    location: 'Bole, Addis Ababa',
    items: [{ name: 'Nido Milk', qty: 2, price: 25 }, { name: 'Bread', qty: 3, price: 5 }],
  },
  {
    id: '10243', customer: 'Sara', total: 80, time: '09:10 AM', status: 'Preparing',
    location: 'CMC, Addis Ababa',
    items: [{ name: 'Coconut Oil', qty: 2, price: 14 }, { name: 'Lotion', qty: 4, price: 12 }],
  },
  {
    id: '10238', customer: 'Dawit', total: 210, time: 'Yesterday', status: 'Ready for Pickup',
    location: 'Megenagna, Addis Ababa',
    items: [{ name: 'Vitamins', qty: 1, price: 40 }, { name: 'Nido Milk', qty: 6, price: 25 }],
  },
  {
    id: '10230', customer: 'Hanna', total: 64, time: 'Yesterday', status: 'Delivered',
    location: 'Piassa, Addis Ababa',
    items: [{ name: 'Shampoo', qty: 2, price: 9 }, { name: 'Lotion', qty: 3, price: 12 }],
  },
];

export const demoReviews = [
  { id: 'r1', customer: 'Ahmed', product: 'Coconut Oil', rating: 5, comment: 'Very good product and fast delivery.', date: 'Aug 15' },
  { id: 'r2', customer: 'Sara', product: 'Nido Milk', rating: 4, comment: 'Good quality, arrived on time.', date: 'Aug 14' },
  { id: 'r3', customer: 'Dawit', product: 'Shampoo', rating: 3, comment: 'Decent, but packaging could improve.', date: 'Aug 13' },
];

export const demoEarnings = {
  available: 8420,
  pending: 1250,
  totalEarned: 35780,
  transactions: [
    { id: 'tx1', date: 'Aug 15', order: '#10251', amount: 125, commission: 6.25, net: 118.75 },
    { id: 'tx2', date: 'Aug 14', order: '#10243', amount: 80, commission: 4.0, net: 76.0 },
    { id: 'tx3', date: 'Aug 14', order: '#10238', amount: 210, commission: 10.5, net: 199.5 },
  ],
};
