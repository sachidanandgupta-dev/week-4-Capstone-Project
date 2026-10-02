// Pure helpers (unit-tested in tests/orderTotal.test.js)
const calcTotal = (items) =>
  Math.round(items.reduce((sum, i) => sum + i.price * i.qty, 0) * 100) / 100;

const validateAddress = (a = {}) => {
  const required = ['fullName', 'line1', 'city', 'postalCode', 'phone'];
  for (const k of required) {
    if (!a[k] || !String(a[k]).trim()) return `Address field "${k}" is required`;
  }
  if (!/^\d{10}$/.test(String(a.phone).trim())) return 'Phone must be 10 digits';
  return null;
};

module.exports = { calcTotal, validateAddress };
