import { CartModel } from '../models/Cart.model.js';
import { ProductModel } from '../models/Product.model.js';

class CartManager {

static async create() {
    return this.createCart();
  }


  // crear un carrito vacio
  static async createCart() {
    const cart = await CartModel.create({ products: [] });
    return cart.toObject();
  }

  // obtener un carrito por id
  static async getById(cartId, { populate = false } = {}) {
    let query = CartModel.findById(cartId);

    if (populate) {
      query = query.populate('products.product');
    }

    const cart = await query.lean();

    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return cart;
  }

  static async getCartById(cartId, options) {
    return this.getById(cartId, options);
  }

  // agregar producto al carrito (o sumar cantidad si ya existe)
  static async addProduct(cartId, productId, quantity = 1) {
    const productExists = await ProductModel.exists({ _id: productId });
    if (!productExists) {
      const err = new Error('El producto indicado no existe');
      err.statusCode = 404;
      throw err;
    }

    const cart = await CartModel.findById(cartId);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const index = cart.products.findIndex((p) =>
      p.product.toString() === productId
    );

    if (index === -1) {
      cart.products.push({
        product: productId,
        quantity,
      });
    } else {
      cart.products[index].quantity += quantity;
    }

    const updated = await cart.save();
    return updated.toObject();
  }

  static async addProductToCart(cartId, productId, quantity = 1) {
    return this.addProduct(cartId, productId, quantity);
  }

  // reemplazar todo el arreglo de productos
  static async updateProducts(cartId, productsInput) {
    if (!Array.isArray(productsInput)) {
      const err = new Error('El formato de productos debe ser un arreglo');
      err.statusCode = 400;
      throw err;
    }

    const cart = await CartModel.findById(cartId);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    cart.products = productsInput.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity) || 1,
    }));

    const updated = await cart.save();
    return updated.toObject();
  }

  // actualizar solo la cantidad de un producto
  static async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const index = cart.products.findIndex((p) =>
      p.product.toString() === productId
    );

    if (index === -1) {
      const err = new Error('El producto no existe en el carrito');
      err.statusCode = 404;
      throw err;
    }

    cart.products[index].quantity = Number(quantity);

    const updated = await cart.save();
    return updated.toObject();
  }

  // eliminar un producto del carrito
  static async removeProduct(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const initialLength = cart.products.length;

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId
    );

    if (cart.products.length === initialLength) {
      const err = new Error('El producto no existe en el carrito');
      err.statusCode = 404;
      throw err;
    }

    const updated = await cart.save();
    return updated.toObject();
  }

  // vaciar por completo el carrito
  static async clear(cartId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    cart.products = [];
    const updated = await cart.save();
    return updated.toObject();
  }
}

export default CartManager;