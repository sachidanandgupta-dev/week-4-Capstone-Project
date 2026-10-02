import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ p }) {
  const { add } = useCart();
  return (
    <div className="pcard">
      <Link to={`/product/${p._id}`}>
        <img src={p.image || 'https://placehold.co/600x450?text=No+Image'} alt={p.name} loading="lazy" />
      </Link>
      <div className="pbody">
        <span className="tag">{p.category}</span>
        <Link to={`/product/${p._id}`}><h3>{p.name}</h3></Link>
        <strong>{money(p.price)}</strong>
        <button className="btn" disabled={p.stock < 1} onClick={() => add(p)}>
          {p.stock < 1 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
