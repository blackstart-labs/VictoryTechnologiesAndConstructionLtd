"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  RiBookOpenLine,
  RiAddLine,
  RiDeleteBinLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiEditLine,
  RiCloseLine,
  RiPlayList2Fill,
  RiAttachmentLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "react-icons/ri";
import { courseService } from "@/services/course.service";
import type { CourseResponseDto, ModuleResponseDto } from "@/types";

// Validation schema for basic course details
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().min(0, "Price cannot be negative"),
  instructorName: z.string().min(2, "Instructor name must be at least 2 characters"),
  isPublished: z.boolean(),
});

type CourseForm = z.infer<typeof courseSchema>;

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  
  // Dialog visibility states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponseDto | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "curriculum">("details");

  // Curriculum sub-states
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<{ id?: string; title: string; description?: string; order: number; isPublished: boolean } | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ id?: string; moduleId: string; title: string; videoUrl?: string; order: number; durationInSeconds: number; isPublished: boolean } | null>(null);
  const [editingResource, setEditingResource] = useState<{ id?: string; moduleId: string; title: string; url: string; type: string } | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { isPublished: false }
  });

  // Query Courses (Admin gets both published and draft courses)
  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => courseService.getAll(false),
  });

  const courses: CourseResponseDto[] = coursesRes?.data ?? [];

  // Query Modules for the selected course
  const { data: modulesRes, refetch: refetchModules } = useQuery({
    queryKey: ["admin-course-modules", editingCourse?.id],
    queryFn: () => (editingCourse ? courseService.getModules(editingCourse.id) : Promise.resolve({ data: [] })),
    enabled: !!editingCourse && activeTab === "curriculum",
  });

  const modules: ModuleResponseDto[] = modulesRes?.data ?? [];

  // Create Course Mutation
  const createMutation = useMutation({
    mutationFn: (data: CourseForm) => courseService.create(data),
    onSuccess: () => {
      toast.success("Course created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      reset();
      setShowAddForm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update Course Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseForm }) => courseService.update(id, data),
    onSuccess: () => {
      toast.success("Course updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setEditingCourse(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete Course Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.delete(id),
    onSuccess: () => {
      toast.success("Course deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Curriculum Mutations ───────────────────────────────────────────
  
  const saveModuleMutation = useMutation({
    mutationFn: (payload: any) => {
      if (payload.id) {
        return courseService.updateModule(payload.id, payload);
      }
      return courseService.createModule({ ...payload, courseId: editingCourse!.id });
    },
    onSuccess: () => {
      toast.success("Module saved successfully!");
      refetchModules();
      setEditingModule(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteModule(id),
    onSuccess: () => {
      toast.success("Module removed!");
      refetchModules();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveLessonMutation = useMutation({
    mutationFn: (payload: any) => {
      if (payload.id) {
        return courseService.updateLesson(payload.id, payload);
      }
      return courseService.addLesson(payload);
    },
    onSuccess: () => {
      toast.success("Lesson video class saved!");
      refetchModules();
      setEditingLesson(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteLesson(id),
    onSuccess: () => {
      toast.success("Lesson deleted!");
      refetchModules();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addResourceMutation = useMutation({
    mutationFn: (payload: any) => courseService.addResourceLink(payload),
    onSuccess: () => {
      toast.success("Attachment resource added!");
      refetchModules();
      setEditingResource(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteResourceLink(id),
    onSuccess: () => {
      toast.success("Attachment resource removed!");
      refetchModules();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleEditClick = (course: CourseResponseDto) => {
    setEditingCourse(course);
    setActiveTab("details");
    setValue("title", course.title);
    setValue("description", course.description || "");
    setValue("price", course.price);
    setValue("instructorName", course.instructorName || "");
    setValue("isPublished", course.isPublished);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Manage Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create courses, design curriculum modules, assign classes, and link download resources.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingCourse(null);
            reset();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
        >
          <RiAddLine /> Create Course
        </button>
      </div>

      {/* Basic Create Course Popup */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            className="rounded-2xl border border-border bg-background p-6 space-y-4 shadow-2xl w-full max-w-2xl my-8 relative animate-in fade-in zoom-in-95 duration-200 text-foreground"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-base text-heading">New Course Blueprint</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <RiCloseLine className="text-lg" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Title</label>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Instructor Name</label>
                <input
                  type="text"
                  {...register("instructorName")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {errors.instructorName && <p className="text-xs text-destructive">{errors.instructorName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price (BDT)</label>
                <input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id="isPublishedAdd"
                  type="checkbox"
                  {...register("isPublished")}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
                />
                <label htmlFor="isPublishedAdd" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <textarea
                rows={3}
                {...register("description")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-foreground"
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-all text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/15"
              >
                {createMutation.isPending ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Course & Curriculum Nested Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="rounded-2xl border border-border bg-background p-6 space-y-4 shadow-2xl w-full max-w-4xl my-8 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] text-foreground">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-2 shrink-0">
              <div>
                <h3 className="font-bold text-lg text-heading">Course Configurator</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{editingCourse.title}</p>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            {/* Config Tabs */}
            <div className="flex border-b border-border shrink-0">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "details"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Basic Details
              </button>
              <button
                onClick={() => setActiveTab("curriculum")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "curriculum"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Curriculum Structure (Modules & Lessons)
              </button>
            </div>

            {/* Scrollable Viewport */}
            <div className="flex-1 overflow-y-auto py-2 pr-1 min-h-[40vh] space-y-4">
              {activeTab === "details" ? (
                /* ── Basic details update form ── */
                <form
                  onSubmit={handleSubmit((d) => updateMutation.mutate({ id: editingCourse.id, data: d }))}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Title</label>
                      <input
                        type="text"
                        {...register("title")}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      />
                      {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Instructor Name</label>
                      <input
                        type="text"
                        {...register("instructorName")}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      />
                      {errors.instructorName && <p className="text-xs text-destructive">{errors.instructorName.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Price (BDT)</label>
                      <input
                        type="number"
                        {...register("price", { valueAsNumber: true })}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      />
                      {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        id="isPublishedEdit"
                        type="checkbox"
                        {...register("isPublished")}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
                      />
                      <label htmlFor="isPublishedEdit" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                        Publish immediately
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Description</label>
                    <textarea
                      rows={4}
                      {...register("description")}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-foreground"
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/15"
                    >
                      {updateMutation.isPending ? "Saving..." : "Save Course Details"}
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Modules & lessons editor panel ── */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-sm font-bold text-heading">Course Syllabus</h4>
                    <button
                      type="button"
                      onClick={() => setEditingModule({ title: "", description: "", order: modules.length + 1, isPublished: true })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-all"
                    >
                      <RiAddLine /> Add Module
                    </button>
                  </div>

                  {modules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center max-w-md mx-auto">
                      <RiPlayList2Fill className="text-4xl text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-semibold">No modules inside this course yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modules.map((m) => {
                        const isExpanded = expandedModule === m.id;
                        return (
                          <div key={m.id} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                            {/* Module header */}
                            <div className="p-4 bg-background flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpandedModule(isExpanded ? null : m.id)}>
                              <div className="flex items-center gap-2 min-w-0">
                                {isExpanded ? <RiArrowUpSLine className="text-lg shrink-0 text-muted-foreground" /> : <RiArrowDownSLine className="text-lg shrink-0 text-muted-foreground" />}
                                <div className="min-w-0">
                                  <h5 className="font-bold text-xs sm:text-sm text-heading truncate">{m.title}</h5>
                                  {m.description && <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setEditingModule({ id: m.id, title: m.title, description: m.description, order: m.order, isPublished: m.isPublished })}
                                  className="p-1 hover:text-primary hover:bg-primary/5 rounded border border-border transition-all"
                                  title="Edit Module Details"
                                >
                                  <RiEditLine className="text-xs" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this module and all its classes?")) {
                                      deleteModuleMutation.mutate(m.id);
                                    }
                                  }}
                                  className="p-1 hover:text-destructive hover:bg-destructive/5 rounded border border-border transition-all"
                                  title="Delete Module"
                                >
                                  <RiDeleteBinLine className="text-xs" />
                                </button>
                              </div>
                            </div>

                            {/* Collapsed content container */}
                            {isExpanded && (
                              <div className="p-4 border-t border-border space-y-4 bg-card animate-in slide-in-from-top-1 duration-150">
                                
                                {/* Video classes/lessons list */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h6 className="text-[11px] font-bold text-heading uppercase tracking-wider flex items-center gap-1">
                                      <RiPlayList2Fill className="text-primary text-sm" /> Classes & Videos
                                    </h6>
                                    <button
                                      onClick={() => setEditingLesson({ moduleId: m.id, title: "", videoUrl: "", order: (m.videoLessons?.length || 0) + 1, durationInSeconds: 600, isPublished: true })}
                                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                    >
                                      <RiAddLine /> Add Video Class
                                    </button>
                                  </div>

                                  {(m.videoLessons || []).length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground italic">No classes listed in this module.</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {(m.videoLessons || []).map((l) => (
                                        <div key={l.id} className="flex items-center justify-between p-2 rounded-lg border border-border/80 bg-muted/10 text-xs">
                                          <div className="min-w-0">
                                            <span className="font-semibold text-heading truncate block">{l.title}</span>
                                            {l.videoUrl && <span className="text-[9px] text-muted-foreground font-mono block truncate">{l.videoUrl}</span>}
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[9px] text-muted-foreground">Order: {l.order}</span>
                                            <button
                                              onClick={() => setEditingLesson({ id: l.id, moduleId: m.id, title: l.title, videoUrl: l.videoUrl, order: l.order, durationInSeconds: l.durationInSeconds, isPublished: l.isPublished })}
                                              className="p-1 hover:text-primary transition-all text-xs"
                                              title="Edit Class Details"
                                            >
                                              <RiEditLine />
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (confirm("Delete this video lesson?")) {
                                                  deleteLessonMutation.mutate(l.id);
                                                }
                                              }}
                                              className="p-1 hover:text-destructive transition-all text-xs"
                                              title="Delete Class"
                                            >
                                              <RiDeleteBinLine />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Resource attachments list */}
                                <div className="space-y-2 border-t border-border/60 pt-3">
                                  <div className="flex items-center justify-between">
                                    <h6 className="text-[11px] font-bold text-heading uppercase tracking-wider flex items-center gap-1">
                                      <RiAttachmentLine className="text-secondary text-sm" /> Handouts & Blueprints
                                    </h6>
                                    <button
                                      onClick={() => setEditingResource({ moduleId: m.id, title: "", url: "", type: "Pdf" })}
                                      className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-0.5"
                                    >
                                      <RiAddLine /> Add Handout
                                    </button>
                                  </div>

                                  {(m.resourceLinks || []).length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground italic">No handouts listed inside this module.</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {(m.resourceLinks || []).map((r) => (
                                        <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border border-border/80 bg-muted/10 text-xs">
                                          <div className="min-w-0">
                                            <span className="font-semibold text-heading truncate block">{r.title}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono block truncate">{r.url}</span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary text-[8px] font-bold uppercase">{r.type}</span>
                                            <button
                                              onClick={() => {
                                                if (confirm("Remove this attachment?")) {
                                                  deleteResourceMutation.mutate(r.id);
                                                }
                                              }}
                                              className="p-1 hover:text-destructive transition-all text-xs"
                                              title="Remove Resource"
                                            >
                                              <RiDeleteBinLine />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border pt-3 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-all"
              >
                Close Editor
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Sub-Editor Forms Modals ── */}
      
      {/* 1. Module Add/Edit */}
      {editingModule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-xl border border-border bg-background p-5 space-y-4 shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 text-foreground">
            <h4 className="font-bold text-sm text-heading">{editingModule.id ? "Edit Module Parameters" : "Add Course Module"}</h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Title</label>
                <input
                  type="text"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  value={editingModule.description || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none resize-none text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Order</label>
                  <input
                    type="number"
                    value={editingModule.order}
                    onChange={(e) => setEditingModule({ ...editingModule, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                  />
                </div>

                <div className="flex items-center gap-1.5 pt-4">
                  <input
                    id="modulePublishToggle"
                    type="checkbox"
                    checked={editingModule.isPublished}
                    onChange={(e) => setEditingModule({ ...editingModule, isPublished: e.target.checked })}
                    className="w-3.5 h-3.5 text-primary border-border rounded"
                  />
                  <label htmlFor="modulePublishToggle" className="text-[10px] font-bold text-muted-foreground cursor-pointer">Published</label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEditingModule(null)}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-border hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => saveModuleMutation.mutate(editingModule)}
                disabled={!editingModule.title.trim()}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                Save Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Video Lesson Add/Edit */}
      {editingLesson && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-xl border border-border bg-background p-5 space-y-4 shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 text-foreground">
            <h4 className="font-bold text-sm text-heading">{editingLesson.id ? "Edit Video Class Details" : "Add Video Class"}</h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Class Title</label>
                <input
                  type="text"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Video Stream URL</label>
                <input
                  type="text"
                  value={editingLesson.videoUrl || ""}
                  placeholder="https://..."
                  onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Class Order</label>
                  <input
                    type="number"
                    value={editingLesson.order}
                    onChange={(e) => setEditingLesson({ ...editingLesson, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={editingLesson.durationInSeconds}
                    onChange={(e) => setEditingLesson({ ...editingLesson, durationInSeconds: parseInt(e.target.value) || 600 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <input
                  id="lessonPublishToggle"
                  type="checkbox"
                  checked={editingLesson.isPublished}
                  onChange={(e) => setEditingLesson({ ...editingLesson, isPublished: e.target.checked })}
                  className="w-3.5 h-3.5 text-primary border-border rounded"
                />
                <label htmlFor="lessonPublishToggle" className="text-[10px] font-bold text-muted-foreground cursor-pointer">Publish Video Immediately</label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-border hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => saveLessonMutation.mutate(editingLesson)}
                disabled={!editingLesson.title.trim()}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                Save Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Resource Attachment Add */}
      {editingResource && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-xl border border-border bg-background p-5 space-y-4 shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 text-foreground">
            <h4 className="font-bold text-sm text-heading">Add Resource Handout</h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Resource Title</label>
                <input
                  type="text"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Attachment Link URL</label>
                <input
                  type="text"
                  value={editingResource.url}
                  placeholder="https://..."
                  onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Resource Type</label>
                <select
                  value={editingResource.type}
                  onChange={(e) => setEditingResource({ ...editingResource, type: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                >
                  <option value="Pdf">PDF Document</option>
                  <option value="Zip">ZIP/RAR Archive</option>
                  <option value="Link">Web URL Link</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEditingResource(null)}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-border hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => addResourceMutation.mutate(editingResource)}
                disabled={!editingResource.title.trim() || !editingResource.url.trim()}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses List Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border p-6 flex gap-4 animate-pulse bg-background">
              <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-background max-w-lg mx-auto">
          <RiBookOpenLine className="text-5xl text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg text-heading">No courses exist</h3>
          <p className="text-sm text-muted-foreground">Get started by creating your very first course blueprint.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-border bg-background p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/30 transition-all"
            >
              <div className="flex gap-4 items-center min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${course.isPublished ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-muted/80 border-border text-muted-foreground/50"}`}>
                  {course.isPublished ? <RiCheckDoubleLine className="text-xl animate-pulse" /> : <RiErrorWarningLine className="text-lg" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-foreground truncate">{course.title}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${course.isPublished ? "bg-green-500/10 border-green-500/25 text-green-500" : "bg-muted border-border text-muted-foreground"}`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{course.instructorName} • BDT {course.price}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 justify-end">
                <button
                  onClick={() => handleEditClick(course)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border hover:border-primary/20 rounded-xl transition-all"
                  title="Configure Course Curriculum"
                >
                  <RiEditLine className="text-base" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this course and all associated structures?")) {
                      deleteMutation.mutate(course.id);
                    }
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-border hover:border-destructive/20 rounded-xl transition-all"
                  title="Delete Course"
                >
                  <RiDeleteBinLine className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
