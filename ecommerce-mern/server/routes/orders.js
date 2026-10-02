const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { calcTotal, validateAddress } = require('../utils/orderTotal');

router.use(protect);

// Place order: prices come from the DB (never trust the client), stock is decremented atomically
router.post('/', async (req, res, next) => {
  const reserved = [];
  try {
    const { items, address } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    const addrErr = validateAddress(address);
    if (addrErr) return res.status(400).json({ message: addrErr });

    const lines = [];
    for (const it of items) {
      const qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });
      const p = await Product.findById(it.product);
      if (!p) return res.status(404).json({ message: 'A product in your cart no longer exists' });

      const r = await Product.updateOne({ _id: p._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
      if (r.modifiedCount === 0) {
        throw Object.assign(new Error(`Not enough stock for "${p.name}"`), { status: 409 });
      }
      reserved.push({ id: p._id, qty });
      lines.push({ product: p._id, name: p.name, price: p.price, image: p.image, qty });
    }

    const order = await Order.create({
      user: req.user._id,
      items: lines,
      address,
      total: calcTotal(lines),
    });
    res.status(201).json(order);
  } catch (e) {
    // roll back stock reserved so far
    await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
    next(e);
  }
});

router.get('/mine', async (req, res, next) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});

// ---- admin ----
router.get('/all', adminOnly, async (req, res, next) => {
  try { res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});

router.get('/stats', adminOnly, async (req, res, next) => {
  try {
    const [orders, products, users, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    ]);
    res.json({ orders, products, users, revenue: revenueAgg[0]?.sum || 0 });
  } catch (e) { next(e); }
});

router.put('/:id/status', adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['placed', 'shipped', 'delivered', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // restock when an order is cancelled for the first time
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (e) { next(e); }
});

module.exports = router;
