import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();

//  lista de productos por HTTP
router.get('/', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.render('home', { title: 'Home', products });
  } catch (err) {
    next(err);
  }
});

// vista en tiempo real
router.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.render('realTimeProducts', { title: 'Productos en tiempo real', products });
  } catch (err) {
    next(err);
  }
});

export default router;