import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

// Postgres error codes that map onto a meaningful HTTP response instead of a 500.
const PG_ERRORS = {
  // The bookings_no_overlap exclusion constraint rejected the row.
  '23P01': () => ApiError.conflict('SLOT_UNAVAILABLE', 'That time slot is already taken for this space'),
  '23505': () => ApiError.conflict('ALREADY_EXISTS', 'A record with those details already exists'),
  '23503': () => ApiError.badRequest('Referenced record does not exist'),
  '23514': () => ApiError.badRequest('The submitted values violate a database constraint'),
};

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`No route matches ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let apiError = error;

  if (!(apiError instanceof ApiError)) {
    if (error.code && PG_ERRORS[error.code]) {
      apiError = PG_ERRORS[error.code]();
    } else if (error.name === 'TokenExpiredError') {
      apiError = new ApiError(401, 'TOKEN_EXPIRED', 'Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      apiError = new ApiError(401, 'INVALID_TOKEN', 'Access token is invalid');
    } else if (error.type === 'entity.parse.failed') {
      apiError = ApiError.badRequest('Request body is not valid JSON');
    } else {
      apiError = new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong on our side');
    }
  }

  if (apiError.status >= 500) {
    console.error(`${req.method} ${req.originalUrl}`, error);
  }

  const body = {
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  };

  if (apiError.details) {
    body.error.details = apiError.details;
  }
  if (apiError.status >= 500 && config.env !== 'production') {
    body.error.cause = error.message;
  }

  res.status(apiError.status).json(body);
}
