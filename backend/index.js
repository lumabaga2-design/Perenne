require('dotenv').config();
const express = require('express');
const cors    = require('cors');

//  importación de las rutas de cada módulo 
const customerRoutes = require('./modules/customers/customer.routes');
const userRoutes     = require('./modules/users/user.routes');
const contentRoutes  = require('./modules/content/content.routes');
const productRoutes  = require('./modules/products/product.routes');
const feedRoutes     = require('./modules/feed/feed.routes');
const cartRoutes     = require('./modules/cart/cart.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const shipmentRoutes = require('./modules/shipments/shipment.routes');
const interactionRoutes = require('./modules/interactions/interaction.routes');
const searchRoutes = require('./modules/search/search.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const reviewRoutes = require('./modules/reviews/review.routes');




const app = express();
app.use(cors());          // Permite peticiones desde el frontend
app.use(express.json());  // Permite recibir datos en formato JSON

//  Rutas 
app.use('/api/customers', customerRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/content',   contentRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/feed',      feedRoutes);
app.use('/api/cart',      cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);

//  Inicio del servidor 

app.get('/api/test', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.execute('SELECT 1');
    res.status(200).json({ message: '✅ Servidor y base de datos conectados correctamente' });
  } catch (error) {
    res.status(500).json({ message: '❌ Error de conexión', error: error.message });
  }
});

const SERVER_PORT = 8080;

app.listen(SERVER_PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${SERVER_PORT}`);
});