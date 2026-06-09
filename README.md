E-commerce Backend
API REST de un carrito de compras. Empezó como proyecto del curso de backend en CoderHouse y después le metí mano para dejarlo con una arquitectura que no me dé vergüenza mostrar.
¿Qué hace?
Básicamente lo que haría cualquier tienda online por debajo — productos, carritos, cantidades. Sin frontend flashero, puro backend.

Productos con paginación, filtros y orden por precio
Carritos con toda la operatoria — agregar, actualizar cantidades, vaciar
Las capas bien separadas — cada archivo hace una sola cosa
Errores manejados de forma centralizada, no con ifs por todos lados
Tiempo real con Socket.io para la vista de productos
Todo persistido en MongoDB Atlas

Stack
Node.js · Express · MongoDB Atlas · Mongoose · Handlebars · Socket.io
