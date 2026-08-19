import axios from 'axios';
import { clearSession, readSession, writeSession } from './session.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

// Set by AuthContext so a dead refresh token can drop the user back to login.
let onSessionExpired = () => {};
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

api.interceptors.request.use((request) => {
  const session = readSession();
  if (session?.accessToken) {
    request.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return request;
});

// Access tokens live for 15 minutes. When one expires mid-session we refresh
// once and replay the request; parallel requests that fail at the same time
// wait on that single refresh instead of each firing their own.
let refreshRequest = null;

function refreshSession() {
  if (!refreshRequest) {
    const session = readSession();
    refreshRequest = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken: session?.refreshToken })
      .then(({ data }) => {
        writeSession(data);
        return data;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isExpired = error.response?.status === 401 && !request._retried;
    const session = readSession();

    if (!isExpired || !session?.refreshToken || request.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    request._retried = true;
    try {
      const refreshed = await refreshSession();
      request.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return api(request);
    } catch (refreshError) {
      clearSession();
      onSessionExpired();
      return Promise.reject(refreshError);
    }
  },
);

/** Pulls the message out of the API's error envelope for display in the UI. */
export function readApiError(error, fallback = 'Something went wrong') {
  const payload = error?.response?.data?.error;
  if (!payload) return error?.message || fallback;
  if (payload.details?.length) {
    return payload.details.map((detail) => detail.message).join('. ');
  }
  return payload.message || fallback;
}
