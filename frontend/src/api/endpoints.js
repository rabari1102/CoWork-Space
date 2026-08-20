import { api } from './client.js';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me').then((res) => res.data.user),
  updateProfile: (payload) => api.patch('/auth/me', payload).then((res) => res.data.user),
};

export const spacesApi = {
  list: (params) => api.get('/spaces', { params }).then((res) => res.data),
  get: (id) => api.get(`/spaces/${id}`).then((res) => res.data.space),
  availability: (id, date) =>
    api.get(`/spaces/${id}/availability`, { params: { date } }).then((res) => res.data),
  create: (payload) => api.post('/spaces', payload).then((res) => res.data.space),
  update: (id, payload) => api.patch(`/spaces/${id}`, payload).then((res) => res.data.space),
  remove: (id) => api.delete(`/spaces/${id}`),
  summary: () => api.get('/spaces/summary').then((res) => res.data),
  maintenance: (id) => api.get(`/spaces/${id}/maintenance`).then((res) => res.data.data),
  addMaintenance: (id, payload) =>
    api.post(`/spaces/${id}/maintenance`, payload).then((res) => res.data.maintenance),
  removeMaintenance: (id, maintenanceId) =>
    api.delete(`/spaces/${id}/maintenance/${maintenanceId}`),
};

export const bookingsApi = {
  create: (payload) => api.post('/bookings', payload).then((res) => res.data.booking),
  mine: (params) => api.get('/bookings/me', { params }).then((res) => res.data),
  myStats: () => api.get('/bookings/me/stats').then((res) => res.data.stats),
  all: (params) => api.get('/bookings', { params }).then((res) => res.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then((res) => res.data.booking),
  approve: (id) => api.patch(`/bookings/${id}/approve`).then((res) => res.data),
  reject: (id) => api.patch(`/bookings/${id}/reject`).then((res) => res.data.booking),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api
      .post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};
