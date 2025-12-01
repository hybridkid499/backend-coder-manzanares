const socket = io();

// elementos del DOM
const productsList = document.getElementById('products-list');
const addForm = document.getElementById('add-product-form');
const deleteForm = document.getElementById('delete-product-form');
const messages = document.getElementById('messages');

// renderizar lista de productos
function renderProducts(products) {
  productsList.innerHTML = '';

  if (!products.length) {
    const li = document.createElement('li');
    li.textContent = 'No hay productos todavía.';
    productsList.appendChild(li);
    return;
  }

  products.forEach(prod => {
    const li = document.createElement('li');
    li.dataset.id = prod._id;
    li.innerHTML = `<strong>${prod.title}</strong> - $${prod.price} (stock: ${prod.stock})`;
    productsList.appendChild(li);
  });
}

// escuchar actualizacion completa dede el servidor
socket.on('productsUpdated', products => {
  renderProducts(products);
  messages.textContent = '';
});

// escuchar errores desde el servidor
socket.on('errorMessage', msg => {
  messages.textContent = `Error: ${msg}`;
});

// manejar envio de formulario de creacion
addForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(addForm);

  const thumbnailsRaw = formData.get('thumbnails') || '';
  const thumbnails = thumbnailsRaw
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const productInput = {
    title: formData.get('title'),
    description: formData.get('description'),
    code: formData.get('code'),
    price: Number(formData.get('price')),
    status: formData.get('status') === 'on',
    stock: Number(formData.get('stock')),
    category: formData.get('category'),
    thumbnails
  };

  socket.emit('newProduct', productInput);
  addForm.reset();
});

// Manejar envio de formulario de borrado
deleteForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(deleteForm);
  const id = formData.get('id');
  socket.emit('deleteProduct', id);
  deleteForm.reset();
});