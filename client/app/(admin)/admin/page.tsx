"use client";

import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { projectService } from "@/services/project.service";
import { cmsService } from "@/services/cms.service";
import { jobService } from "@/services/job.service";
import { userService } from "@/services/user.service";
import { paymentService } from "@/services/progress.service";
import {
  RiBookOpenLine,
  RiBuildingLine,
  RiSettings4Line,
  RiTeamLine,
  RiShieldCheckLine,
  RiBriefcaseLine,
  RiMoneyDollarCircleLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiErrorWarningLine,
} from "react-icons/ri";

export default function AdminDashboardPage() {
  // Fetch telemetry datasets
  const { data: coursesRes, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => courseService.getAll(false),
  });

  const { data: projectsRes, isLoading: projectsLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => projectService.getAll(false),
  });

  const { data: chatbotRes, isLoading: chatbotLoading } = useQuery({
    queryKey: ["cms-chatbot-context"],
    queryFn: () => cmsService.getByIdentifier("ai-chatbot-context"),
  });

  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => jobService.getAll(false),
  });

  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userService.getAll(),
  });

  const { data: paymentsRes, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => paymentService.getAllPayments(),
  });

  const courses = coursesRes?.data || [];
  const projects = projectsRes?.data || [];
  const chatbotActive = chatbotRes?.data?.isActive ? "Active" : "Inactive";
  const jobs = jobsRes?.data || [];
  const users = usersRes?.data || [];
  const payments = paymentsRes?.data || [];

  // Metrics computing
  const totalRevenue = payments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === "Pending" || p.status === "Submitted").length;
  const approvedPayments = payments.filter((p) => p.status === "Success" || p.status === "Approved").length;

  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const runningProjects = projects.filter((p) => p.status === "Running" || p.status === "Ongoing").length;

  const adminUsers = users.filter((u) => u.role === "Admin").length;
  const studentUsers = users.filter((u) => u.role === "Student").length;

  const stats = [
    {
      label: "Total Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      loading: paymentsLoading,
      icon: RiMoneyDollarCircleLine,
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    },
    {
      label: "Showcase Projects",
      value: `${completedProjects} Done / ${runningProjects} Running`,
      loading: projectsLoading,
      icon: RiBuildingLine,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Active Enrolled Students",
      value: studentUsers,
      loading: usersLoading,
      icon: RiTeamLine,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      loading: paymentsLoading,
      icon: RiTimeLine,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-heading">Admin Analytics & System Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed metrics, financial reconciliations, career openings telemetry, and project completions status.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, loading, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-6 space-y-4 hover:border-primary/30 transition-all hover:shadow-md duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">{label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
                <Icon className="text-xl" />
              </div>
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              ) : (
                <span className="text-2xl font-extrabold tracking-tight text-heading">{value}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Breakdown & Metrics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Course Popularity & Registry Metrics */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <h3 className="font-bold text-base text-heading border-b border-border pb-3 flex items-center gap-2">
            <RiBookOpenLine className="text-primary text-lg" />
            <span>Course Enrollments & Inventory</span>
          </h3>

          {coursesLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-xs text-muted-foreground">No courses registered in catalog.</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                // Count students enrolled in this course
                const count = users.filter((u) =>
                  u.enrolledCourses?.some((ec) => ec.courseId === course.id)
                ).length;

                return (
                  <div key={course.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-heading truncate max-w-[70%]">{course.title}</span>
                      <span className="text-muted-foreground">{count} Enrolled</span>
                    </div>
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (count / Math.max(1, studentUsers)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Ratios & Registry Counts */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <h3 className="font-bold text-base text-heading border-b border-border pb-3 flex items-center gap-2">
            <RiShieldCheckLine className="text-secondary text-lg" />
            <span>Operational Assets Summary</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Courses / Projects count */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Total Courses</span>
              <p className="text-xl font-bold text-heading">{courses.length}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Careers Postings</span>
              <p className="text-xl font-bold text-heading">{jobs.length}</p>
            </div>

            {/* Chatbot Context Status */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Chatbot Context</span>
              <p className="text-xl font-bold text-heading">{chatbotLoading ? "..." : chatbotActive}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Admin Staff</span>
              <p className="text-xl font-bold text-heading">{adminUsers} Account{adminUsers !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider mb-2">Payment Verification Pipeline</h4>
            <div className="flex gap-4">
              <span className="px-3 py-1 rounded bg-green-500/10 border border-green-500/25 text-green-500 text-xs font-bold flex items-center gap-1">
                <RiCheckboxCircleLine /> Approved: {approvedPayments}
              </span>
              <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-bold flex items-center gap-1">
                <RiTimeLine /> Pending: {pendingPayments}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* System Status section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-heading mb-4">System Status & Environment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Gateway Base URL</span>
            <p className="text-sm font-mono text-primary font-medium truncate">http://localhost:5237/api</p>
          </div>
          <div className="space-y-1 md:pl-6 pt-4 md:pt-0">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Storage Engine</span>
            <p className="text-sm text-heading font-medium">PostgreSQL (NeonDB)</p>
          </div>
          <div className="space-y-1 md:pl-6 pt-4 md:pt-0">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Seeded Database</span>
            <p className="text-sm text-green-500 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              ONLINE & ACTIVE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
