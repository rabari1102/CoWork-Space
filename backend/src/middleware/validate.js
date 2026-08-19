import { ApiError } from '../utils/ApiError.js';

/**
 * Validates the named request parts against zod schemas and replaces them with
 * the parsed output, so controllers only ever see coerced, trusted values.
 */
export function validate(schemas) {
  return (req, res, next) => {
    const details = [];

    for (const part of ['params', 'query', 'body']) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (result.success) {
        // req.query is a getter on newer Express versions, so assign in place.
        if (part === 'query') {
          Object.defineProperty(req, 'query', { value: result.data, writable: true });
        } else {
          req[part] = result.data;
        }
      } else {
        for (const issue of result.error.issues) {
          details.push({
            field: [part, ...issue.path].join('.'),
            message: issue.message,
          });
        }
      }
    }

    if (details.length > 0) {
      return next(new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed', details));
    }
    next();
  };
}
