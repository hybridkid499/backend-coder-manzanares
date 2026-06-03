import { ProductModel } from '../models/Product.model.js';
import AppError from '../utils/AppError.js';

class ProductManager {

  static async getAll() {
    return ProductModel.find().lean();
  }

  static async paginate({ limit = 10, page = 1, sort, query } = {}) {
    const filter = {};

    if (query) {
      if (query.includes(':')) {
        const [fieldRaw, valueRaw] = query.split(':');
        const field = fieldRaw.trim();
        const value = valueRaw.trim();
        if (field === 'category') filter.category = value;
        else if (field === 'status') filter.status = value === 'true';
      } else {
        filter.category = query;
      }
    }

    const sortOption = {};
    if (sort === 'asc') sortOption.price = 1;
    if (sort === 'desc') sortOption.price = -1;

    const limitNum = Number(limit) > 0 ? Number(limit) : 10;
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const skip = (pageNum - 1) * limitNum;

    const [docs, totalDocs] = await Promise.all([
      ProductModel.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalDocs / limitNum));
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    return {
      docs,
      totalDocs,
      limit: limitNum,
      page: pageNum,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? pageNum - 1 : null,
      nextPage: hasNextPage ? pageNum + 1 : null,
      sort: sort || null,
      query: query || null,
    };
  }

  static async getById(id) {
    const product = await ProductModel.findById(id).lean();
    if (!product) throw new AppError('Producto no encontrado', 404);
    return product;
  }

  static async add(productData) {
    const created = await ProductModel.create(productData);
    return created.toObject();
  }

  static async update(id, fields) {
    const updated = await ProductModel.findByIdAndUpdate(id, fields, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) throw new AppError('Producto no encontrado', 404);
    return updated;
  }

  static async remove(id) {
    const deleted = await ProductModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new AppError('Producto no encontrado', 404);
    return { deleted: true };
  }
}

export default ProductManager;