import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [f, setF] = useState({ search: '', category: '', sort: 'newest' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/products/categories').then((r) => setCategories(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
        const { data } = await api.get('/products', { params });
        setProducts(data);
        setError('');
      } catch (e) { setError(errMsg(e)); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [f]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <div className="row filters">
        <input placeholder="Search products…" value={f.search} onChange={set('search')} />
        <select value={f.category} onChange={set('category')}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={f.sort} onChange={set('sort')}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
      {error && <p className="error banner">{error}</p>}
      {loading ? <p className="center">Loading…</p> : products.length === 0 ? (
        <p className="center muted">No products found.</p>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
      )}
    </>
  );
}
