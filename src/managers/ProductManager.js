import { readJson, writeJson } from '../utils/fileDb.js';
import { randomUUID } from 'crypto';

const PRODUCTS_PATH = 'data/products.json';

export default class ProductManager {
  static async getAll() {
    return await readJson(PRODUCTS_PATH, []);
  }

  static async getById(id) {
    const all = await this.getAll();
    return all.find(p => String(p.id) === String(id)) || null;
  }

  static async add(productInput) {
    const required = ['title', 'description', 'code', 'price', 'status', 'stock', 'category'];
    const missing = required.filter(k => productInput[k] === undefined);
    if (missing.length) {
      const err = new Error(`Faltan campos requeridos: ${missing.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const all = await this.getAll();

    const newProduct = {
      id: randomUUID(), // autogenerado
      title: String(productInput.title),
      description: String(productInput.description),
      code: String(productInput.code),
      price: Number(productInput.price),
      status: Boolean(productInput.status),
      stock: Number(productInput.stock),
      category: String(productInput.category),
      thumbnails: Array.isArray(productInput.thumbnails) ? productInput.thumbnails.map(String) : []
    };

    all.push(newProduct);
    await writeJson(PRODUCTS_PATH, all);
    return newProduct;
  }

  static async update(id, updateInput) {
    const all = await this.getAll();
    const idx = all.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      const err = new Error('Producto no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const { id: _ignore, ...rest } = updateInput; // no permitir cambiar id
    const updated = { ...all[idx], ...rest };
    all[idx] = updated;
    await writeJson(PRODUCTS_PATH, all);
    return updated;
  }

  static async remove(id) {
    const all = await this.getAll();
    const filtered = all.filter(p => String(p.id) !== String(id));
    if (filtered.length === all.length) {
      const err = new Error('Producto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    await writeJson(PRODUCTS_PATH, filtered);
    return { deleted: true };
  }
}