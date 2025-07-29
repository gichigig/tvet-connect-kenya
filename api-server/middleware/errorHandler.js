/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal server error',
    status: err.status || 500
  };

  // Firebase errors
  if (err.code) {
    switch (err.code) {
      case 'permission-denied':
        error.status = 403;
        error.message = 'Permission denied';
        break;
      case 'not-found':
        error.status = 404;
        error.message = 'Resource not found';
        break;
      case 'already-exists':
        error.status = 409;
        error.message = 'Resource already exists';
        break;
      case 'invalid-argument':
        error.status = 400;
        error.message = 'Invalid request data';
        break;
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation failed';
    error.details = err.errors;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(error.details && { details: error.details })
  });
};
