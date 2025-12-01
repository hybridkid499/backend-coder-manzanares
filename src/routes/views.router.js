import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import CartManager from '../managers/CartManager.js';

const router = Router();

// rediigimos la raiz a /products 
router.get('/', (req, res) => {
  res.redirect('/products');
});

// vista de productos con paginacion: GET /products
router.get('/products', async (req, res, next) => {
  try {
    const { limit, page, sort, query } = req.query;

    const result = await ProductManager.paginate({ limit, page, sort, query });

    
    res.render('home', {
      title: 'Productos',
      products: result.docs,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
      },
      currentQuery: query || '',
      currentSort: sort || '',
      currentLimit: limit || 10,
    });
  } catch (err) {
    next(err);
  }
});

// vista en tiempo real
router.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.render('realTimeProducts', {
      title: 'Productos en tiempo real',
      products,
    });
  } catch (err) {
    next(err);
  }
});


router.get('/products/:pid', async (req, res, next) => {
  try {
    const product = await ProductManager.getById(req.params.pid);
    res.render('productDetail', {
      title: product.title,
      product,
    });
  } catch (err) {
    next(err);
  }
});

// vista de un carrito especifico: GET /carts/:cid
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await CartManager.getById(req.params.cid, { populate: true });

    
    res.render('cart', {
      title: `Carrito ${cart._id}`,
      cart,
      products: cart.products, 
    });
  } catch (err) {
    next(err);
  }
});

export default router;