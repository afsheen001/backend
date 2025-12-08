// ----------------------
// IMPORTS
// ----------------------
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

// ----------------------
// APP SETUP
// ----------------------
const app = express();
const PORT = 3000;

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors());
app.use(express.json());

// ✅ Serve images from backend/images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// ----------------------
// DATABASE CONNECTION
// ----------------------
const MONGO_URL = 'mongodb+srv://Afsheen01:Afsheen123@cluster0.g2sqvyv.mongodb.net/';
const DB_NAME = 'afsheen';
let db;

MongoClient.connect(MONGO_URL)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

// ----------------------
// GET ALL LESSONS
// ----------------------
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await db.collection('lessons').find().toArray();

    const lessonsWithImages = lessons.map(lesson => ({
      ...lesson,
      image: lesson.image.startsWith('http')
        ? lesson.image
        : `${req.protocol}://${req.get('host')}/${lesson.image}`
    }));

    res.json(lessonsWithImages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// ----------------------
// PLACE ORDER
// ----------------------
app.post('/orders', async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Reduce seats
    for (const item of items) {
      const lesson = await db.collection('lessons').findOne({
        _id: new ObjectId(item._id)
      });

      if (!lesson || lesson.seats <= 0) {
        throw new Error(`No seats left for ${item.subject}`);
      }

      await db.collection('lessons').updateOne(
        { _id: new ObjectId(item._id) },
        { $inc: { seats: -1 } }
      );
    }

    const order = {
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      items: items.map(item => ({
        lessonId: new ObjectId(item._id),
        subject: item.subject,
        price: item.price
      })),
      createdAt: new Date()
    };

    await db.collection('orders').insertOne(order);

    res.json({ message: '✅ Order placed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------
// GET ALL ORDERS
// ----------------------
app.get('/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ----------------------
// SEED LESSONS (RUN ONCE)
// ----------------------
app.get('/seed-lessons', async (req, res) => {
  try {
    const count = await db.collection('lessons').countDocuments();
    if (count > 0) {
      return res.json({ message: 'Lessons already exist' });
    }

    await db.collection('lessons').insertMany([
      { subject:'Drawing & Sketching', location:'Dubai', price:'AED 800', features:'Pencil & shading', seats:10, image:'images/drawing.jpg' },
      { subject:'Painting', location:'Sharjah', price:'AED 950', features:'Oil & acrylic', seats:8, image:'images/painting.jpg' },
      { subject:'Graphic Design', location:'Dubai Marina', price:'AED 1200', features:'Photoshop', seats:5, image:'images/graphic.jpg' },
      { subject:'Interior Design', location:'Abu Dhabi', price:'AED 1500', features:'3D planning', seats:7, image:'images/interior.jpg' },
      { subject:'Ceramics & Pottery', location:'Ajman', price:'AED 1100', features:'Clay work', seats:6, image:'images/ceramics.jpg' },
      { subject:'Fabric Design', location:'Al Ain', price:'AED 1000', features:'Textile printing', seats:9, image:'images/fabric.jpg' },
      { subject:'Accessory Design', location:'Dubai', price:'AED 900', features:'Jewelry', seats:4, image:'images/accessory.jpg' },
      { subject:'Calligraphy', location:'Sharjah', price:'AED 700', features:'Arabic lettering', seats:12, image:'images/calligraphy.jpg' },
      { subject:'Photography', location:'Dubai Media City', price:'AED 1100', features:'Editing', seats:5, image:'images/photography.jpg' },
      { subject:'Art & Craft', location:'Dubai', price:'AED 600', features:'DIY crafts', seats:15, image:'images/artcraft.jpg' }
    ]);

    res.json({ message: '✅ Lessons seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed lessons' });
  }
});

// ----------------------
// START SERVER
// ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
