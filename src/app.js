import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { engine as handlebars } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Creamos servidor HTTP a partir de Express (para usar con socket.io)
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer);

// Middlewares JSON / forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static (para JS del cliente, CSS, etc.)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configuración de Handlebars
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '..', 'views'));

// Routers API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Router de vistas
app.use('/', viewsRouter);

// Healthcheck
app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

// Socket.io: canales de tiempo real
io.on('connection', async socket => {
  console.log('Nuevo cliente conectado');

  // Enviar lista inicial de productos al conectarse
  const products = await ProductManager.getAll();
  socket.emit('productsUpdated', products);

  // Crear producto desde formulario realtime (vía socket)
  socket.on('newProduct', async productInput => {
    try {
      await ProductManager.add(productInput);
      const updated = await ProductManager.getAll();
      // Avisar a TODOS los clientes conectados
      io.emit('productsUpdated', updated);
    } catch (err) {
      console.error('Error al crear producto desde socket:', err.message);
      socket.emit('errorMessage', err.message);
    }
  });

  // Eliminar producto desde formulario realtime
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

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});


httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});