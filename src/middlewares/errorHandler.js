// Transforme les erreurs techniques en messages clairs pour l'app mobile
function notFound(req, res) {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.values(err.errors).forEach((e) => {
      errors[e.path] = e.message;
    });
    return res.status(400).json({ message: 'Données invalides', errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Cette référence existe déjà', errors: { reference: 'Cette référence existe déjà' } });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur' });
}

module.exports = { notFound, errorHandler };
