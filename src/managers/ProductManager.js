import { ProductModel } from '../models/Product.model.js';

class ProductManager {
  // obtener todos los productos 
  static async getAll() {
    const products = await ProductModel.find().lean();
    return products;
  }

  // paginar, filtrar y ordenar productos
  static async paginate({ limit = 10, page = 1, sort, query } = {}) {
    const filter = {};

    // Filtro por query
    if (query) {
      if (query.includes(':')) {
        const [fieldRaw, valueRaw] = query.split(':');
        const field = fieldRaw.trim();
        const value = valueRaw.trim();

        if (field === 'category') {
          filter.category = value;
        } else if (field === 'status') {
          
          filter.status = value === 'true';
        }
      } else {
        // Si no viene con "campo:valor", asumimos categoría
        filter.category = query;
      }
    }

    // ordenamiento por precio
    const sortOption = {};
    if (sort === 'asc') sortOption.price = 1;
    if (sort === 'desc') sortOption.price = -1;

    const limitNum = Number(limit) > 0 ? Number(limit) : 10;
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const skip = (pageNum - 1) * limitNum;

    const [docs, totalDocs] = await Promise.all([
      ProductModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalDocs / limitNum));
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;
    const prevPage = hasPrevPage ? pageNum - 1 : null;
    const nextPage = hasNextPage ? pageNum + 1 : null;

    return {
      docs,
      totalDocs,
      limit: limitNum,
      page: pageNum,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      sort: sort || null,
      query: query || null,
    };
  }

  // obtener un producto por id
  static async getById(id) {
    const product = await ProductModel.findById(id).lean();

    if (!product) {
      const err = new Error('Producto no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return product;
  }

  // crear un producto nuevo
  static async add(productInput) {
    const requiredFields = [
      'title',
      'description',
      'code',
      'price',
      'stock',
      'category',
    ];

    for (const field of requiredFields) {
      if (!productInput[field] && productInput[field] !== 0) {
        const err = new Error(`Falta el campo obligatorio: ${field}`);
        err.statusCode = 400;
        throw err;
      }
    }

    // validar codigo unico
    const existing = await ProductModel.findOne({ code: productInput.code });
    if (existing) {
      const err = new Error('Ya existe un producto con ese código');
      err.statusCode = 409;
      throw err;
    }

    const thumbnailsRaw = productInput.thumbnails ?? [];
    const thumbnails = Array.isArray(thumbnailsRaw)
      ? thumbnailsRaw.map(String)
      : String(thumbnailsRaw)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const newProductData = {
      title: String(productInput.title),
      description: String(productInput.description),
      code: String(productInput.code),
      price: Number(productInput.price),
      status:
        typeof productInput.status === 'boolean'
          ? productInput.status
          : true,
      stock: Number(productInput.stock),
      category: String(productInput.category),
      thumbnails,
    };

    const created = await ProductModel.create(newProductData);
    return created.toObject();
  }

  // actualizar un producto por id (sin tocar el id)
  static async update(id, updateInput) {
    const { id: _ignoreId, _id: _ignore_id, ...rest } = updateInput;

    if (Object.keys(rest).length === 0) {
      const err = new Error('No se recibieron campos para actualizar');
      err.statusCode = 400;
      throw err;
    }

    if (rest.price !== undefined) {
      rest.price = Number(rest.price);
    }
    if (rest.stock !== undefined) {
      rest.stock = Number(rest.stock);
    }

    if (rest.status !== undefined) {
      rest.status = Boolean(rest.status);
    }

    if (rest.thumbnails !== undefined) {
      const raw = rest.thumbnails;
      rest.thumbnails = Array.isArray(raw)
        ? raw.map(String)
        : String(raw)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }

    const updated = await ProductModel.findByIdAndUpdate(id, rest, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      const err = new Error('Producto no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return updated;
  }

  // eliminar un producto por id
  static async remove(id) {
    const deleted = await ProductModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      const err = new Error('Producto no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return { deleted: true };
  }
}

export default ProductManager;