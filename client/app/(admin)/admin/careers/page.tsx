"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  RiBriefcaseLine,
  RiAddLine,
  RiDeleteBinLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiEditLine,
  RiCloseLine,
  RiMapPinLine,
  RiCoinsLine,
} from "react-icons/ri";
import { jobService } from "@/services/job.service";
import type { JobResponseDto } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  jobType: z.string().min(2, "Job type must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  requirements: z.string().min(5, "Requirements must be at least 5 characters"),
  salaryRange: z.string().max(100),
  googleFormUrl: z.string().url("Must be a valid Google Form URL"),
  isPublished: z.boolean(),
});

type JobForm = z.infer<typeof schema>;

export default function AdminCareersPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobResponseDto | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(schema),
    defaultValues: { isPublished: true, salaryRange: "Negotiable" }
  });

  // Query all jobs (published & draft)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => jobService.getAll(false),
  });

  const jobs: JobResponseDto[] = data?.data ?? [];

  // Create job mutation
  const createMutation = useMutation({
    mutationFn: (data: JobForm) => jobService.create(data),
    onSuccess: () => {
      toast.success("Job posting created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      reset();
      setShowAddForm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update job mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobForm }) => jobService.update(id, data),
    onSuccess: () => {
      toast.success("Job posting updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      setEditingJob(null);
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      toast.success("Job posting deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleEditClick = (job: JobResponseDto) => {
    setEditingJob(job);
    setValue("title", job.title);
    setValue("department", job.department);
    setValue("location", job.location);
    setValue("jobType", job.jobType);
    setValue("description", job.description);
    setValue("requirements", job.requirements);
    setValue("salaryRange", job.salaryRange);
    setValue("googleFormUrl", job.googleFormUrl);
    setValue("isPublished", job.isPublished);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Careers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Post engineering opportunities, architectural roles, and track applications via Google Forms.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingJob(null);
            reset();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
        >
          <RiAddLine /> Add Job Role
        </button>
      </div>

      {/* Form Modal */}
      {(showAddForm || editingJob) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit((d) => {
              if (editingJob) {
                updateMutation.mutate({ id: editingJob.id, data: d });
              } else {
                createMutation.mutate(d);
              }
            })}
            className="rounded-2xl border border-border bg-background p-6 space-y-4 shadow-2xl w-full max-w-2xl my-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-base text-heading">
                {editingJob ? "Edit Job Posting" : "Create New Job Opening"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingJob(null);
                  reset();
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <RiCloseLine className="text-lg" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Structural Engineer"
                  {...register("title")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Department</label>
                <select
                  {...register("department")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Interior Design">Interior Design</option>
                  <option value="Construction Management">Construction Management</option>
                  <option value="Administration">Administration</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
                {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka (Head Office) / Cumilla Branch"
                  {...register("location")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
              </div>

              {/* Job Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Job Type</label>
                <select
                  {...register("jobType")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
                {errors.jobType && <p className="text-xs text-destructive">{errors.jobType.message}</p>}
              </div>

              {/* Salary Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. 50,000 - 70,000 BDT or Negotiable"
                  {...register("salaryRange")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {errors.salaryRange && <p className="text-xs text-destructive">{errors.salaryRange.message}</p>}
              </div>

              {/* Google Form Url */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Google Form Link (Application)</label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/forms/d/..."
                  {...register("googleFormUrl")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {errors.googleFormUrl && <p className="text-xs text-destructive">{errors.googleFormUrl.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Job Description</label>
              <textarea
                rows={3}
                placeholder="Detail core responsibilities..."
                {...register("description")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-foreground"
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            {/* Requirements */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Requirements (One rule per line)</label>
              <textarea
                rows={3}
                placeholder="B.Sc. in Civil Engineering&#10;3+ years structural detailing experience&#10;Proficiency in ETABS & AutoCAD"
                {...register("requirements")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-foreground"
              />
              {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="isPublished"
                type="checkbox"
                {...register("isPublished")}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
              />
              <label htmlFor="isPublished" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                Publish Immediately (Make visible to public career seekers)
              </label>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingJob(null);
                  reset();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-all text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/15"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Role"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs Catalog */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border p-6 flex gap-4 animate-pulse bg-background">
              <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-background max-w-lg mx-auto">
          <RiBriefcaseLine className="text-5xl text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg text-heading">No careers posted</h3>
          <p className="text-sm text-muted-foreground">Setup recruitment positions to dynamically build your VDCBD consultant team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-border bg-background p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/30 transition-all"
            >
              <div className="flex gap-4 items-center min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${job.isPublished ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-muted/80 border-border text-muted-foreground/50"}`}>
                  {job.isPublished ? <RiCheckDoubleLine className="text-xl animate-pulse" /> : <RiErrorWarningLine className="text-lg" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-foreground truncate">{job.title}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${job.isPublished ? "bg-green-500/10 border-green-500/25 text-green-500" : "bg-muted border-border text-muted-foreground"}`}>
                      {job.isPublished ? "Active" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="font-semibold text-primary">{job.department}</span>
                    <span className="flex items-center gap-1"><RiMapPinLine /> {job.location}</span>
                    <span className="flex items-center gap-1"><RiCoinsLine /> {job.salaryRange}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 justify-end">
                <button
                  onClick={() => handleEditClick(job)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border hover:border-primary/20 rounded-xl transition-all"
                  title="Edit Role Details"
                >
                  <RiEditLine className="text-base" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this job posting?")) {
                      deleteMutation.mutate(job.id);
                    }
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-border hover:border-destructive/20 rounded-xl transition-all"
                  title="Delete Posting"
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
