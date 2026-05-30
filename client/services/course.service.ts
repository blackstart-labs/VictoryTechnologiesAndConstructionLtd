import api from "@/lib/api";
import type { ApiResponse, CourseResponseDto, ModuleResponseDto } from "@/types";

export const courseService = {
  getAll: (publishedOnly = true) =>
    api.get<ApiResponse<CourseResponseDto[]>>(`/course?publishedOnly=${publishedOnly}`).then((r) => r.data),

  getEnrolled: () =>
    api.get<ApiResponse<CourseResponseDto[]>>("/course/enrolled").then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<CourseResponseDto>>(`/course/${id}`).then((r) => r.data),

  getModules: (courseId: string) =>
    api.get<ApiResponse<ModuleResponseDto[]>>(`/coursemodule/by-course/${courseId}`).then((r) => r.data),

  create: (data: Partial<CourseResponseDto>) =>
    api.post<ApiResponse<CourseResponseDto>>("/course", data).then((r) => r.data),

  update: (id: string, data: Partial<CourseResponseDto>) =>
    api.put<ApiResponse<CourseResponseDto>>(`/course/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<string>>(`/course/${id}`).then((r) => r.data),

  // Module Operations
  createModule: (data: { courseId: string; title: string; description?: string; order: number; isPublished: boolean }) =>
    api.post<ApiResponse<ModuleResponseDto>>("/coursemodule", data).then((r) => r.data),

  updateModule: (id: string, data: { title: string; description?: string; order: number; isPublished: boolean }) =>
    api.put<ApiResponse<ModuleResponseDto>>(`/coursemodule/${id}`, data).then((r) => r.data),

  deleteModule: (id: string) =>
    api.delete<ApiResponse<boolean>>(`/coursemodule/${id}`).then((r) => r.data),

  // Lesson Operations
  addLesson: (data: { moduleId: string; title: string; videoUrl?: string; order: number; durationInSeconds: number; isPublished: boolean }) =>
    api.post<ApiResponse<any>>("/coursemodule/lessons", data).then((r) => r.data),

  updateLesson: (id: string, data: { title: string; videoUrl?: string; order: number; durationInSeconds: number; isPublished: boolean }) =>
    api.put<ApiResponse<any>>(`/coursemodule/lessons/${id}`, data).then((r) => r.data),

  deleteLesson: (id: string) =>
    api.delete<ApiResponse<boolean>>(`/coursemodule/lessons/${id}`).then((r) => r.data),

  // Resource Operations
  addResourceLink: (data: { moduleId: string; title: string; url: string; type: string }) =>
    api.post<ApiResponse<boolean>>("/coursemodule/resources", data).then((r) => r.data),

  deleteResourceLink: (id: string) =>
    api.delete<ApiResponse<boolean>>(`/coursemodule/resources/${id}`).then((r) => r.data),
};
