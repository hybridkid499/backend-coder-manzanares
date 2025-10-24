import { readJson, writeJson } from '../utils/fileDb.js';
import { randomUUID } from 'crypto';
import ProductManager from './ProductManager.js';

const CARTS_PATH = 'data/carts.json';

export default class CartManager {
  static async getAll() {
    return await readJson(CARTS_PATH, []);
  }

  static async getById(id) {
    const all = await this.getAll();
    return all.find(c => String(c.id) === String(id)) || null;
  }

  static async create() {
    const all = await this.getAll();
    const newCart = { id: randomUUID(), products: [] };
    all.push(newCart);
    await writeJson(CARTS_PATH, all);
    return newCart;
  }

  static async addProduct(cid, pid) {
    const carts = await this.getAll();
    const cartIdx = carts.findIndex(c => String(c.id) === String(cid));
    if (cartIdx === -1) {
      const err = new Error('Carrito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    // validar existencia del producto
    const product = await ProductManager.getById(pid);
    if (!product) {
      const err = new Error('Producto no existe');
      err.statusCode = 404;
      throw err;
    }

    const cart = carts[cartIdx];
    const i = cart.products.findIndex(it => String(it.product) === String(pid));

    if (i === -1) {
      cart.products.push({ product: String(pid), quantity: 1 });
    } else {
      cart.products[i].quantity += 1;
    }

    carts[cartIdx] = cart;
    await writeJson(CARTS_PATH, carts);
    return cart;
  }
}