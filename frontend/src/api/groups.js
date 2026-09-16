import api from "./axios";

export const groupsApi = {
  create: (name) => api.post("/groups", { name }).then((r) => r.data.group),
  addMember: (groupId, identifier) =>
    api
      .post(`/groups/${groupId}/members`, { identifier })
      .then((r) => r.data.member),
  mine: () => api.get("/groups/mine").then((r) => r.data.groups),
  progress: (groupId) =>
    api.get(`/groups/${groupId}/progress`).then((r) => r.data),
  all: () => api.get("/groups").then((r) => r.data.groups),
};
