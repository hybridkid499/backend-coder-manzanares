import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();

// POST /api/carts/ → crear carrito
router.post('/', async (req, res, next) => {
  try {
    const created = await CartManager.create();
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// GET /api/carts/:cid → listar productos del carrito
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await CartManager.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: true, message: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (err) { next(err); }
});

// POST /api/carts/:cid/product/:pid → agregar/incrementar
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const cart = await CartManager.addProduct(req.params.cid, req.params.pid);
    res.status(201).json(cart);
  } catch (err) { next(err); }
});

export default router;