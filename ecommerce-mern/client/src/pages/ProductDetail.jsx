import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => { api.get(`/products/${id}`).then((r) => setP(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  if (error) return <p className="error banner">{error}</p>;
  if (!p) return <p className="center">Loading…</p>;

  return (
    <div className="card detail">
      <img src={p.image || 'https://placehold.co/600x450?text=No+Image'} alt={p.name} />
      <div className="info">
        <Link to="/" className="muted">← Back to shop</Link>
        <span className="tag">{p.category}</span>
        <h2>{p.name}</h2>
        <h3>{money(p.price)}</h3>
        <p>{p.description}</p>
        <p className="muted">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
        {p.stock > 0 && (
          <div className="row">
            <input type="number" min="1" max={p.stock} value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value) || 1)))} />
            <button className="btn" onClick={() => { add(p, qty); setAdded(true); }}>Add to cart</button>
          </div>
        )}
        {added && <p>Added! <Link to="/cart">Go to cart</Link></p>}
      </div>
    </div>
  );
}
