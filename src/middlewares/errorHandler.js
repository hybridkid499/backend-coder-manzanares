const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: true,
      message: `ID inválido: ${err.value}`,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({
      error: true,
      message: `Error de validación: ${messages}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({
      error: true,
      message: `Ya existe un registro con ese ${field}`,
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;