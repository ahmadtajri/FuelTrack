/**
 * Global Error Handler Middleware
 */

function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  // Axios error from ML service
  if (err.response) {
    return res.status(502).json({
      error: 'ML Service Error',
      message: err.response.data?.detail || 'ML service returned an error',
    });
  }

  // Connection refused (ML service not running)
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'ML Service Unavailable',
      message: 'ML service is not running. Please start the Python FastAPI service on port 8000.',
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
}

module.exports = { errorHandler };
