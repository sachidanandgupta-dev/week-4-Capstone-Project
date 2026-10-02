import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../api.js';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0)
    return <div className="card center"><h2>Your cart is empty</h2><Link to="/">Continue shopping</Link></div>;

  return (
    <div className="card">
      <h2>Your cart</h2>
      <ul className="list">
        {items.map(({ product: p, qty }) => (
          <li key={p._id}>
            <img src={p.image} alt={p.name} className="thumb" />
            <div className="grow"><strong>{p.name}</strong><p className="muted">{money(p.price)} each</p></div>
            <input type="number" className="qty" min="1" max={p.stock} value={qty}
              onChange={(e) => setQty(p._id, Number(e.target.value) || 1)} />
            <strong>{money(p.price * qty)}</strong>
            <button className="btn small danger" onClick={() => remove(p._id)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3 className="right">Total: {money(total)}</h3>
      <button className="btn" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
    </div>
  );
}
