import api from './axios';

export const submissionsApi = {
  confirm: (assignmentId, groupId) =>
    api.post(`/submissions/${assignmentId}/confirm`, { group_id: groupId }).then((r) => r.data.submission),
};

export const analyticsApi = {
  overview: () => api.get('/analytics/overview').then((r) => r.data),
};
