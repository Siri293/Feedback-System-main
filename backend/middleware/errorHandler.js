/**
 * Global error handling middleware.
 * Must be registered as the LAST middleware in server.js.
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry — this record already exists'
    });
  }

  // MySQL connection issues
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed. Please try again later.'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected error occurred'
  });
}

module.exports = errorHandler;
