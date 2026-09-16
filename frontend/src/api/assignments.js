import api from './axios';

export const assignmentsApi = {
  list: () => api.get('/assignments').then((r) => r.data.assignments),
  create: (payload) => api.post('/assignments', payload).then((r) => r.data.assignment),
  update: (id, payload) => api.put(`/assignments/${id}`, payload).then((r) => r.data.assignment),
  submissions: (id) => api.get(`/assignments/${id}/submissions`).then((r) => r.data),
};
