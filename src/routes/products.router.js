import { Router } from 'express';
import ProductService from '../services/product.service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { limit, page, sort, query } = req.query;
    const result = await ProductService.paginate({ limit, page, sort, query });

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

router.get('/:pid', async (req, res, next) => {
  try {
    const product = await ProductService.getById(req.params.pid);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await ProductService.add(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await ProductService.update(req.params.pid, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:pid', async (req, res, next) => {
  try {
    const result = await ProductService.remove(req.params.pid);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;