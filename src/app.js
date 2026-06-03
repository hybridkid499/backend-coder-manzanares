import { connectDB } from './config/db.js';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { engine as handlebars } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import errorHandler from './middlewares/errorHandler.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer);

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '..', 'views'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

io.on('connection', async socket => {
  console.log('Nuevo cliente conectado');

  const products = await ProductManager.getAll();
  socket.emit('productsUpdated', products);

  socket.on('newProduct', async productInput => {
    try {
      await ProductManager.add(productInput);
      const updated = await ProductManager.getAll();
      io.emit('productsUpdated', updated);
    } catch (err) {
      console.error('Error al crear producto desde socket:', err.message);
      socket.emit('errorMessage', err.message);
    }
  });

  socket.on('deleteProduct', async productId => {
    try {
      await ProductManager.remove(productId);
      const updated = await ProductManager.getAll();
      io.emit('productsUpdated', updated);
    } catch (err) {
      console.error('Error al eliminar producto desde socket:', err.message);
      socket.emit('errorMessage', err.message);
    }
  });
});

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});