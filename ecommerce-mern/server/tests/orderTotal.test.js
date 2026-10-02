const test = require('node:test');
const assert = require('node:assert');
const { calcTotal, validateAddress } = require('../utils/orderTotal');

test('calcTotal sums price * qty', () => {
  assert.strictEqual(calcTotal([{ price: 100, qty: 2 }, { price: 49.5, qty: 1 }]), 249.5);
});

test('calcTotal avoids floating point drift', () => {
  assert.strictEqual(calcTotal([{ price: 0.1, qty: 3 }]), 0.3);
});

test('calcTotal of empty cart is 0', () => {
  assert.strictEqual(calcTotal([]), 0);
});

test('validateAddress accepts a valid address', () => {
  const a = { fullName: 'A B', line1: 'x', city: 'Noida', postalCode: '201301', phone: '9876543210' };
  assert.strictEqual(validateAddress(a), null);
});

test('validateAddress rejects missing field and bad phone', () => {
  assert.match(validateAddress({ fullName: 'A' }), /required/);
  const bad = { fullName: 'A', line1: 'x', city: 'c', postalCode: '1', phone: '123' };
  assert.match(validateAddress(bad), /10 digits/);
});
