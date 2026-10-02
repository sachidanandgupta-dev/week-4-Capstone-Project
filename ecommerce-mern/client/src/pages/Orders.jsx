import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { errMsg, money } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const { state } = useLocation();

  useEffect(() => { api.get('/orders/mine').then((r) => setOrders(r.data)).catch((e) => setError(errMsg(e))); }, []);

  return (
    <div className="card">
      <h2>My orders</h2>
      {state?.placed && <p className="success banner">Order placed successfully 🎉</p>}
      {error && <p className="error banner">{error}</p>}
      {!orders ? <p className="muted">Loading…</p> : orders.length === 0 ? <p className="muted">No orders yet.</p> : (
        <ul className="list">
          {orders.map((o) => (
            <li key={o._id} className="col">
              <div className="between">
                <span className="muted">#{o._id.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString()}</span>
                <span className={`tag s-${o.status}`}>{o.status}</span>
              </div>
              {o.items.map((i) => <div key={i._id} className="between"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
              <strong className="right">Total: {money(o.total)}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
