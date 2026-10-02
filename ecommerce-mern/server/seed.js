// Usage: npm run seed   (creates admin user + sample products; resets products)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const img = (s) => `https://picsum.photos/seed/${s}/600/450`;
const products = [
  ['Wireless Headphones', 'Over-ear Bluetooth headphones with 30h battery.', 2499, 'Electronics', 25],
  ['Smart Watch', 'Fitness tracking, heart-rate and sleep monitor.', 3999, 'Electronics', 18],
  ['Bluetooth Speaker', 'Portable waterproof speaker with deep bass.', 1799, 'Electronics', 30],
  ['Mechanical Keyboard', 'Hot-swappable keys with RGB backlight.', 3299, 'Electronics', 12],
  ['Cotton T-Shirt', 'Soft 100% cotton regular-fit tee.', 499, 'Fashion', 80],
  ['Denim Jacket', 'Classic mid-wash denim jacket.', 1999, 'Fashion', 22],
  ['Running Shoes', 'Lightweight breathable running shoes.', 2799, 'Fashion', 35],
  ['Backpack 25L', 'Water-resistant laptop backpack.', 1299, 'Fashion', 40],
  ['Ceramic Coffee Mug', 'Set of 2 handmade ceramic mugs.', 399, 'Home', 60],
  ['LED Desk Lamp', 'Dimmable lamp with USB charging port.', 899, 'Home', 45],
  ['Yoga Mat', 'Non-slip 6mm exercise mat.', 699, 'Sports', 50],
  ['Stainless Steel Bottle', '1L insulated bottle, keeps cold 24h.', 599, 'Sports', 70],
].map(([name, description, price, category, stock]) => ({
  name, description, price, category, stock, image: img(name.toLowerCase().replace(/\W+/g, '-')),
}));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = (process.env.ADMIN_EMAIL || 'admin@shop.com').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Admin', email, password: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'admin' });
    console.log(`Admin created: ${email}`);
  } else console.log('Admin already exists');
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
