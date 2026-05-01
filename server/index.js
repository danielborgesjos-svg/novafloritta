const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const multer = require('multer');

const app = express();
const db = new Database('database.db');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        old_price REAL,
        stock INTEGER DEFAULT 0,
        category_id INTEGER,
        description TEXT,
        image TEXT,
        rating REAL DEFAULT 5.0,
        is_new BOOLEAN DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        discount_percentage REAL NOT NULL,
        is_active BOOLEAN DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        delivery_type TEXT DEFAULT 'retirada',
        address TEXT,
        delivery_cost REAL DEFAULT 0,
        observation TEXT,
        payment_method TEXT DEFAULT 'pix',
        total REAL,
        status TEXT DEFAULT 'Pendente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
`);

// Migrate existing orders table if needed
['customer_phone TEXT','delivery_type TEXT','address TEXT','payment_method TEXT','observation TEXT','delivery_cost REAL'].forEach(col => {
    try { db.exec(`ALTER TABLE orders ADD COLUMN ${col}`); } catch (_) {}
});

// Seed categories
const catCount = db.prepare('SELECT count(*) as c FROM categories').get();
if (catCount.c === 0) {
    const ins = db.prepare('INSERT INTO categories (name, icon) VALUES (?, ?)');
    [['Rosas','🌹'],['Buquês','💐'],['Arranjos','🌸'],['Girassóis','🌻']].forEach(([n,i]) => ins.run(n,i));
}

// ── CATEGORIES ──
app.get('/api/categories', (req, res) => {
    res.json(db.prepare('SELECT * FROM categories').all());
});

// ── PRODUCTS ──
app.get('/api/products', (req, res) => {
    res.json(db.prepare('SELECT * FROM products').all());
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, old_price, stock, category_id, description, is_new } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const info = db.prepare(
        'INSERT INTO products (name, price, old_price, stock, category_id, description, image, is_new) VALUES (?,?,?,?,?,?,?,?)'
    ).run(name, price, old_price || null, stock, category_id || null, description || '', image, is_new ? 1 : 0);
    res.json({ id: info.lastInsertRowid, success: true });
});

app.delete('/api/products/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { name, price, old_price, stock, category_id, description, is_new } = req.body;
    let query = 'UPDATE products SET name=?, price=?, old_price=?, stock=?, category_id=?, description=?, is_new=?';
    let params = [name, price, old_price || null, stock, category_id || null, description || '', is_new ? 1 : 0];
    
    if (req.file) {
        query += ', image=?';
        params.push(`/uploads/${req.file.filename}`);
    }
    query += ' WHERE id=?';
    params.push(req.params.id);

    db.prepare(query).run(...params);
    res.json({ success: true });
});

// ── COUPONS ──
app.get('/api/coupons', (req, res) => {
    res.json(db.prepare('SELECT * FROM coupons').all());
});

app.post('/api/coupons', (req, res) => {
    try {
        const info = db.prepare('INSERT INTO coupons (code, discount_percentage) VALUES (?, ?)').run(req.body.code, req.body.discount_percentage);
        res.json({ id: info.lastInsertRowid, success: true });
    } catch(e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/coupons/:id', (req, res) => {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// ── CHECKOUT ──
app.post('/api/checkout', (req, res) => {
    const { customer, items, total, delivery_type, address, payment_method, observation, delivery_cost } = req.body;

    const transaction = db.transaction(() => {
        const orderId = db.prepare(
            'INSERT INTO orders (customer_name, customer_phone, customer_email, delivery_type, address, payment_method, total, observation, delivery_cost) VALUES (?,?,?,?,?,?,?,?,?)'
        ).run(
            customer.name, customer.phone || '', customer.email || '',
            delivery_type || 'retirada', address || '',
            payment_method || 'pix', total, observation || '', delivery_cost || 0
        ).lastInsertRowid;

        const insItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)');
        const updStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
        for (const item of items) {
            insItem.run(orderId, item.id, item.quantity, item.price);
            updStock.run(item.quantity, item.id);
        }
        return orderId;
    });

    try {
        res.json({ orderId: transaction(), success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ORDERS ──
app.get('/api/orders', (req, res) => {
    const orders = db.prepare(`
        SELECT o.*, GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items_summary
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
});

app.put('/api/orders/:id/status', (req, res) => {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    res.json({ success: true });
});

const PORT = 3005;
app.listen(PORT, () => console.log(`Nova Floratta: http://localhost:${PORT}`));
