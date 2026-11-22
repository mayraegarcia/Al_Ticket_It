export function notFound(req, res, next) {
  res.status(404).json({
    error: "Ruta no encontrada",
    ruta: req.originalUrl,
  });
}