import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';


const app = express();
const PORT = 8080; // requisito

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Healthcheck
app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: true, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});