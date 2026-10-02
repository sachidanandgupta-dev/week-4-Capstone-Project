import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, money } from '../api.js';

const empty = { name: '', description: '', price: '', category: '', image: '', stock: '' };
const STATUSES = ['placed', 'shipped', 'delivered', 'cancelled'];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, p, o] = await Promise.all([api.get('/orders/stats'), api.get('/products'), api.get('/orders/all')]);
      setStats(s.data); setProducts(p.data); setOrders(o.data);
    } catch (e) { setError(errMsg(e)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (ev) => {
    ev.preventDefault();
    setError('');
    if (!form.name.trim() || form.price === '' || form.stock === '') return setError('Name, price and stock are required');
    try {
      if (editingId) await api.put(`/products/${editingId}`, form);
      else await api.post('/products', form);
      setForm(empty); setEditingId(null); load();
    } catch (e) { setError(errMsg(e)); }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: p.image, stock: p.stock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); load(); } catch (e) { setError(errMsg(e)); }
  };

  const setStatus = async (id, status) => {
    try { await api.put(`/orders/${id}/status`, { status }); load(); } catch (e) { setError(errMsg(e)); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card">
      <h2>Admin dashboard</h2>
      <div className="row tabs">
        {['overview', 'products', 'orders'].map((t) => (
          <button key={t} className={`btn ${tab === t ? '' : 'ghost'}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {error && <p className="error banner">{error}</p>}

      {tab === 'overview' && stats && (
        <div className="stats">
          <div><h3>{stats.orders}</h3><span className="muted">Orders</span></div>
          <div><h3>{money(stats.revenue)}</h3><span className="muted">Revenue</span></div>
          <div><h3>{stats.products}</h3><span className="muted">Products</span></div>
          <div><h3>{stats.users}</h3><span className="muted">Customers</span></div>
        </div>
      )}

      {tab === 'products' && (
        <>
          <form className="card inner" onSubmit={save}>
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            <input placeholder="Name *" value={form.name} onChange={f('name')} />
            <textarea rows={2} placeholder="Description" value={form.description} onChange={f('description')} />
            <div className="row">
              <input type="number" min="0" placeholder="Price *" value={form.price} onChange={f('price')} />
              <input type="number" min="0" step="1" placeholder="Stock *" value={form.stock} onChange={f('stock')} />
              <input placeholder="Category" value={form.category} onChange={f('category')} />
            </div>
            <input placeholder="Image URL" value={form.image} onChange={f('image')} />
            <div className="row">
              <button className="btn">{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
            </div>
          </form>
          <div className="scroll">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td>
                    <td className="actions">
                      <button className="btn small ghost" onClick={() => edit(p)}>Edit</button>
                      <button className="btn small danger" onClick={() => del(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="scroll">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}<br /><span className="muted">{new Date(o.createdAt).toLocaleDateString()}</span></td>
                  <td>{o.user?.name || 'Deleted user'}<br /><span className="muted">{o.user?.email}</span></td>
                  <td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
