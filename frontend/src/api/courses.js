import api from "./axios";

export const coursesApi = {
  async list() {
    const { data } = await api.get("/courses");
    return data.courses;
  },
  async create(title, description) {
    const { data } = await api.post("/courses", { title, description });
    return data.course;
  },
  async enrollStudent(courseId, identifier) {
    const { data } = await api.post(`/courses/${courseId}/enroll`, {
      identifier,
    });
    return data.enrollment;
  },
};
