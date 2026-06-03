import AppError from '../utils/AppError.js';
import CartManager from '../managers/CartManager.js';

class CartService {

  static async create() {
    return CartManager.create();
  }

  static async getById(cartId, options) {
    return CartManager.getById(cartId, options);
  }

  static async addProduct(cartId, productId, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('La cantidad debe ser un número entero mayor a 0', 400);
    }
    return CartManager.addProduct(cartId, productId, quantity);
  }

  static async updateProducts(cartId, productsInput) {
    if (!Array.isArray(productsInput)) {
      throw new AppError('El formato de productos debe ser un arreglo', 400);
    }
    return CartManager.updateProducts(cartId, productsInput);
  }

  static async updateProductQuantity(cartId, productId, quantity) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      throw new AppError('La cantidad debe ser un número entero mayor a 0', 400);
    }
    return CartManager.updateProductQuantity(cartId, productId, qty);
  }

  static async removeProduct(cartId, productId) {
    return CartManager.removeProduct(cartId, productId);
  }

  static async clear(cartId) {
    return CartManager.clear(cartId);
  }
}

export default CartService;