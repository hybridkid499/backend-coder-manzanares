import { Router } from 'express';
import CartService from '../services/cart.service.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const created = await CartService.create();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await CartService.getById(req.params.cid, { populate: true });
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const quantity = req.body.quantity != null ? Number(req.body.quantity) : 1;
    const cart = await CartService.addProduct(req.params.cid, req.params.pid, quantity);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await CartService.removeProduct(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.put('/:cid', async (req, res, next) => {
  try {
    const productsInput = Array.isArray(req.body) ? req.body : req.body.products;
    const cart = await CartService.updateProducts(req.params.cid, productsInput);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) {
      return res.status(400).json({ error: true, message: 'Se requiere el campo quantity en el body' });
    }
    const cart = await CartService.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await CartService.clear(req.params.cid);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

export default router;