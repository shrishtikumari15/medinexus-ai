// Centralized error handler. Every route/controller should call next(err)
// on failure rather than sending its own ad-hoc error response, so the
// response shape stays consistent across the whole API.

function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode =
    err && (err.code === 'ML_SERVICE_UNAVAILABLE' || err.code === 'ECONNREFUSED')
      ? 503
      : res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500;

  const message =
    err && (err.code === 'ML_SERVICE_UNAVAILABLE' || err.code === 'ECONNREFUSED')
      ? 'ML service is unavailable. Please start the Python service and try again.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // Stack traces only in development — never leak internals in production.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
