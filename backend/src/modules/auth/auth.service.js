import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { query } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';

const publicUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
});

function signAccessToken(user) {
  return jwt.sign({ role: user.role, email: user.email }, config.jwt.accessSecret, {
    subject: String(user.id),
    expiresIn: config.jwt.accessTtl,
  });
}

// Refresh tokens are stored as SHA-256 digests: a leaked database dump does not
// hand an attacker usable tokens.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function issueRefreshToken(user) {
  const token = jwt.sign({ role: user.role }, config.jwt.refreshSecret, {
    subject: String(user.id),
    expiresIn: config.jwt.refreshTtl,
    jwtid: crypto.randomUUID(),
  });

  const { exp } = jwt.decode(token);
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, to_timestamp($3))',
    [user.id, hashToken(token), exp],
  );

  return token;
}

async function issueTokens(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: await issueRefreshToken(user),
    user: publicUser(user),
  };
}

export async function register({ name, email, password }) {
  const existing = await query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    throw ApiError.conflict('EMAIL_TAKEN', 'An account with that email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role`,
    [name, email, passwordHash],
  );

  return issueTokens(rows[0]);
}

export async function login({ email, password }) {
  const { rows } = await query(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
    [email],
  );

  const user = rows[0];
  // Same message either way so the endpoint does not confirm which emails exist.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw ApiError.unauthorized('Email or password is incorrect');
  }

  return issueTokens(user);
}

/**
 * Verifies a refresh token, revokes it, and issues a fresh pair. Rotating on
 * every use means a stolen refresh token stops working as soon as the real
 * owner refreshes.
 */
export async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Refresh token is invalid or has expired');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await query(
    'SELECT id, revoked_at FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash],
  );

  if (stored.rowCount === 0 || stored.rows[0].revoked_at) {
    throw ApiError.unauthorized('Refresh token is no longer valid');
  }

  const users = await query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub]);
  if (users.rowCount === 0) {
    throw ApiError.unauthorized('Account no longer exists');
  }

  await query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [stored.rows[0].id]);

  return issueTokens(users.rows[0]);
}

export async function logout(refreshToken) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
    [hashToken(refreshToken)],
  );
}

export async function getProfile(userId) {
  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) {
    throw ApiError.notFound('User not found');
  }
  return publicUser(rows[0]);
}
