import { CartModel } from '../models/Cart.model.js';
import { ProductModel } from '../models/Product.model.js';
import AppError from '../utils/AppError.js';

class CartManager {

  static async create() {
    const cart = await CartModel.create({ products: [] });
    return cart.toObject();
  }

  static async getById(cartId, { populate = false } = {}) {
    let query = CartModel.findById(cartId);
    if (populate) query = query.populate('products.product');
    const cart = await query.lean();
    if (!cart) throw new AppError('Carrito no encontrado', 404);
    return cart;
  }

  static async addProduct(cartId, productId, quantity) {
    const productExists = await ProductModel.exists({ _id: productId });
    if (!productExists) throw new AppError('El producto indicado no existe', 404);

    const cart = await CartModel.findById(cartId);
    if (!cart) throw new AppError('Carrito no encontrado', 404);

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if (index === -1) {
      cart.products.push({ product: productId, quantity });
    } else {
      cart.products[index].quantity += quantity;
    }

    const updated = await cart.save();
    return updated.toObject();
  }

  static async updateProducts(cartId, productsInput) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new AppError('Carrito no encontrado', 404);

    cart.products = productsInput.map(item => ({
      product: item.product,
      quantity: Number(item.quantity) || 1,
    }));

    const updated = await cart.save();
    return updated.toObject();
  }

  static async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new AppError('Carrito no encontrado', 404);

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if (index === -1) throw new AppError('El producto no existe en el carrito', 404);

    cart.products[index].quantity = quantity;
    const updated = await cart.save();
    return updated.toObject();
  }

  static async removeProduct(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new AppError('Carrito no encontrado', 404);

    const initialLength = cart.products.length;
    cart.products = cart.products.filter(p => p.product.toString() !== productId);

    if (cart.products.length === initialLength) {
      throw new AppError('El producto no existe en el carrito', 404);
    }

    const updated = await cart.save();
    return updated.toObject();
  }

  static async clear(cartId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new AppError('Carrito no encontrado', 404);

    cart.products = [];
    const updated = await cart.save();
    return updated.toObject();
  }
}

export default CartManager;