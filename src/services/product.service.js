import AppError from '../utils/AppError.js';
import ProductManager from '../managers/ProductManager.js';

class ProductService {

  static async getAll() {
    return ProductManager.getAll();
  }

  static async paginate({ limit, page, sort, query } = {}) {
    return ProductManager.paginate({ limit, page, sort, query });
  }

  static async getById(id) {
    return ProductManager.getById(id);
  }

  static async add(productInput) {
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];

    for (const field of requiredFields) {
      if (!productInput[field] && productInput[field] !== 0) {
        throw new AppError(`Falta el campo obligatorio: ${field}`, 400);
      }
    }

    const thumbnailsRaw = productInput.thumbnails ?? [];
    const thumbnails = Array.isArray(thumbnailsRaw)
      ? thumbnailsRaw.map(String)
      : String(thumbnailsRaw).split(',').map(t => t.trim()).filter(Boolean);

    const productData = {
      title: String(productInput.title),
      description: String(productInput.description),
      code: String(productInput.code),
      price: Number(productInput.price),
      status: typeof productInput.status === 'boolean' ? productInput.status : true,
      stock: Number(productInput.stock),
      category: String(productInput.category),
      thumbnails,
    };

    return ProductManager.add(productData);
  }

  static async update(id, updateInput) {
    const { id: _ignoreId, _id: _ignore_id, ...rest } = updateInput;

    if (Object.keys(rest).length === 0) {
      throw new AppError('No se recibieron campos para actualizar', 400);
    }

    if (rest.price !== undefined) rest.price = Number(rest.price);
    if (rest.stock !== undefined) rest.stock = Number(rest.stock);
    if (rest.status !== undefined) rest.status = Boolean(rest.status);

    if (rest.thumbnails !== undefined) {
      const raw = rest.thumbnails;
      rest.thumbnails = Array.isArray(raw)
        ? raw.map(String)
        : String(raw).split(',').map(t => t.trim()).filter(Boolean);
    }

    return ProductManager.update(id, rest);
  }

  static async remove(id) {
    return ProductManager.remove(id);
  }
}

export default ProductService;