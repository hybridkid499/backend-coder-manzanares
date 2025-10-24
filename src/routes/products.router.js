import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();

// GET /api/products/ → listar todos
router.get('/', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.json({ count: products.length, products });
  } catch (err) { next(err); }
});

// GET /api/products/:pid → uno por id
router.get('/:pid', async (req, res, next) => {
  try {
    const product = await ProductManager.getById(req.params.pid);
    if (!product) return res.status(404).json({ error: true, message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) { next(err); }
});

// POST /api/products/ → crear (id autogenerado)
router.post('/', async (req, res, next) => {
  try {
    const created = await ProductManager.add(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// PUT /api/products/:pid → actualizar (no id)
router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await ProductManager.update(req.params.pid, req.body);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/products/:pid → eliminar
router.delete('/:pid', async (req, res, next) => {
  try {
    const result = await ProductManager.remove(req.params.pid);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;