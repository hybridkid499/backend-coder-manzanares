import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();

// GET /api/products/  lista con paginacion, filtos 
router.get('/', async (req, res, next) => {
  try {
    const { limit, page, sort, query } = req.query;

    const result = await ProductManager.paginate({ limit, page, sort, query });

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

    const buildLink = (targetPage) => {
      if (!targetPage) return null;
      const params = new URLSearchParams();

      params.set('page', targetPage);
      if (limit) params.set('limit', limit);
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);

      return `${baseUrl}?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:pid  uno por id
router.get('/:pid', async (req, res, next) => {
  try {
    const product = await ProductManager.getById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: true, message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/  crear 
router.post('/', async (req, res, next) => {
  try {
    const created = await ProductManager.add(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:pid  actualiza
router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await ProductManager.update(req.params.pid, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:pid elimin
router.delete('/:pid', async (req, res, next) => {
  try {
    const result = await ProductManager.remove(req.params.pid);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;