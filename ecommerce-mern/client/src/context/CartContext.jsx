import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const load = () => {
  try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load); // [{ product, qty }]

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = (product, qty = 1) =>
    setItems((cur) => {
      const found = cur.find((i) => i.product._id === product._id);
      if (!found) return [...cur, { product, qty: Math.min(qty, product.stock) }];
      return cur.map((i) =>
        i.product._id === product._id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i
      );
    });
  const setQty = (id, qty) =>
    setItems((cur) => cur.map((i) => (i.product._id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.product.stock)) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i.product._id !== id));
  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
