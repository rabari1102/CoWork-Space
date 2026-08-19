import { z } from 'zod';
import { LOCAL_DATE_TIME_PATTERN, parseLocalDateTime } from './datetime.js';

/**
 * Wall-clock date and time as sent by the browser's datetime-local input.
 * Normalised to seconds precision so two values are always safe to compare as
 * plain strings.
 */
export const localDateTime = z
  .string()
  .regex(LOCAL_DATE_TIME_PATTERN, 'Use the format YYYY-MM-DDTHH:mm')
  .refine((value) => parseLocalDateTime(value) !== null, 'That is not a real date and time')
  .transform((value) => (value.length === 16 ? `${value}:00` : value));
