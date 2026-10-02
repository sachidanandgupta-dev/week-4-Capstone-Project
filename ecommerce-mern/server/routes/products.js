const router = require('express').Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } };

const clean = (b) => {
  const out = {};
  ['name', 'description', 'category', 'image'].forEach((k) => b[k] !== undefined && (out[k] = String(b[k]).trim()));
  if (b.price !== undefined) out.price = Number(b.price);
  if (b.stock !== undefined) out.stock = Number(b.stock);
  return out;
};

const invalid = (d, creating) => {
  if (creating && !d.name) return 'Name is required';
  if (d.name !== undefined && !d.name) return 'Name cannot be empty';
  if (creating && (d.price === undefined || Number.isNaN(d.price))) return 'Valid price is required';
  if (d.price !== undefined && (Number.isNaN(d.price) || d.price < 0)) return 'Price must be 0 or more';
  if (d.stock !== undefined && (!Number.isInteger(d.stock) || d.stock < 0)) return 'Stock must be a whole number ≥ 0';
  return null;
};

router.get('/', async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: escape(search), $options: 'i' };
    res.json(await Product.find(filter).sort(SORTS[sort] || SORTS.newest));
  } catch (e) { next(e); }
});

router.get('/categories', async (req, res, next) => {
  try { res.json(await Product.distinct('category')); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (e) { next(e); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const data = clean(req.body);
    const msg = invalid(data, true);
    if (msg) return res.status(400).json({ message: msg });
    res.status(201).json(await Product.create(data));
  } catch (e) { next(e); }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const data = clean(req.body);
    const msg = invalid(data, false);
    if (msg) return res.status(400).json({ message: msg });
    const p = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (e) { next(e); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
