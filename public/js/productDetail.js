const form = document.getElementById('add-to-cart-form');
const feedback = document.getElementById('feedback');

if (form) {
  const productId = form.dataset.productId;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const cartId = formData.get('cartId')?.trim();
    const quantity = Number(formData.get('quantity')) || 1;

    if (!cartId) {
      feedback.textContent = 'Por favor, ingresá un ID de carrito.';
      return;
    }

    try {
      const response = await fetch(
        `/api/carts/${encodeURIComponent(cartId)}/product/${encodeURIComponent(productId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Error HTTP ${response.status}`);
      }

      feedback.textContent = 'Producto agregado al carrito correctamente ✅';
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      feedback.textContent = `Error al agregar al carrito: ${error.message}`;
    }
  });
}