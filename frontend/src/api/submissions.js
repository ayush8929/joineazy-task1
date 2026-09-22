import api from "./axios";

export const submissionsApi = {
  // groupId is omitted entirely for individual-type assignments —
  // the backend branches on the assignment's own submissionType, not on
  // whether a group_id happens to be present.
  confirm: (assignmentId, groupId) =>
    api
      .post(
        `/submissions/${assignmentId}/confirm`,
        groupId ? { group_id: groupId } : {},
      )
      .then((r) => r.data.submission),
};

export const analyticsApi = {
  overview: () => api.get("/analytics/overview").then((r) => r.data),
};
