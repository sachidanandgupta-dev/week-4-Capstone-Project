import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

const fields = [
  ['fullName', 'Full name'], ['line1', 'Address'], ['city', 'City'],
  ['postalCode', 'Postal code'], ['phone', 'Phone (10 digits)'],
];

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: '', line1: '', city: '', postalCode: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (items.length === 0) return <div className="card center"><p>Your cart is empty.</p><Link to="/">Shop now</Link></div>;

  const validate = () => {
    const e = {};
    fields.forEach(([k, label]) => { if (!address[k].trim()) e[k] = `${label} is required`; });
    if (address.phone && !/^\d{10}$/.test(address.phone.trim())) e.phone = 'Phone must be 10 digits';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setServerError('');
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ product: i.product._id, qty: i.qty })),
        address,
      });
      clear();
      navigate('/orders', { state: { placed: true } });
    } catch (err) { setServerError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>Checkout</h2>
      {serverError && <p className="error banner">{serverError}</p>}
      {fields.map(([k, label]) => (
        <label key={k}>{label}
          <input value={address[k]} onChange={(e) => setAddress({ ...address, [k]: e.target.value })} />
          {errors[k] && <span className="error">{errors[k]}</span>}
        </label>
      ))}
      <p className="muted">Payment: Cash on Delivery</p>
      <h3>Order total: {money(total)}</h3>
      <button className="btn" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
    </form>
  );
}
