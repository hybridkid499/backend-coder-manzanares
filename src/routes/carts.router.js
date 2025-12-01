import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();

// POST /api/carts/  crear carrito vacío
router.post('/', async (req, res, next) => {
  try {
    const created = await CartManager.create();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/carts/:cid  traer carrito 
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await CartManager.getById(req.params.cid, { populate: true });
    // devolvemos el carrito completo con los productos ya populateados
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/carts/:cid/product/:pid → agregar / incrementar producto

router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = quantity != null ? Number(quantity) : 1;

    const cart = await CartManager.addProduct(req.params.cid, req.params.pid, qty);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

//  DELETE /api/carts/:cid/products/:pid  eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await CartManager.removeProduct(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// PUT /api/carts/:cid reemplazar el arreglo de productos

router.put('/:cid', async (req, res, next) => {
  try {
    const productsInput = Array.isArray(req.body)
      ? req.body
      : req.body.products;

    const cart = await CartManager.updateProducts(req.params.cid, productsInput);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// PUT /api/carts/:cid/products/:pid actualizar  la cntidad de un producto

router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) {
      return res.status(400).json({
        error: true,
        message: 'Se requiere el campo quantity en el body',
      });
    }

    const cart = await CartManager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      quantity
    );
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

//  DELETE /api/carts/:cid vacia por completo el carrito
router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await CartManager.clear(req.params.cid);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

export default router;