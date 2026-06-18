"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { courseService } from "@/services/course.service";
import { progressService } from "@/services/progress.service";
import { RiArrowRightLine, RiBookOpenLine, RiMedalLine, RiTimeLine, RiTrophyLine } from "react-icons/ri";
import type { CourseResponseDto } from "@/types";

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0">
      <circle cx="34" cy="34" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/50" />
      <circle
        cx="34" cy="34" r={r} fill="none" stroke="currentColor" strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        strokeDashoffset={circ / 4} className="text-primary transition-all duration-700"
      />
      <text x="34" y="38" textAnchor="middle" className="text-[11px] font-bold fill-foreground">{pct}%</text>
    </svg>
  );
}

function EnrolledCourseCard({ course }: { course: CourseResponseDto }) {
  const { data } = useQuery({
    queryKey: ["progress", course.id],
    queryFn: () => progressService.getCourseProgress(course.id),
  });
  const progress = data?.data;
  const pct = Math.round(progress?.progressPercentage ?? 0);

  return (
    <div className="rounded-2xl border border-border bg-background p-5 flex gap-4 hover:border-primary/40 hover:shadow-md transition-all group">
      <ProgressRing pct={pct} />
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">{course.instructorName}</p>
        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <RiTimeLine className="text-primary" />
            {progress ? `${progress.completedLessons}/${progress.totalLessons} lessons` : "—"}
          </span>
          {progress?.isCourseCompleted && (
            <span className="flex items-center gap-1 text-green-500 font-medium">
              <RiTrophyLine /> Completed
            </span>
          )}
        </div>
        <Link
          href={`/learn/${course.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2 hover:gap-2 transition-all"
        >
          {pct === 0 ? "Start Learning" : pct === 100 ? "Review Course" : "Continue"} <RiArrowRightLine />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: () => courseService.getEnrolled(),
  });

  const courses: CourseResponseDto[] = coursesData?.data ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Good morning, {user?.fullName?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pick up where you left off or explore new courses.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Enrolled Courses", value: courses.length, icon: RiBookOpenLine, color: "text-primary" },
          { label: "Lessons Done", value: "2", icon: RiTimeLine, color: "text-cyan-500" },
          { label: "Certificates", value: "0", icon: RiMedalLine, color: "text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-background p-5">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Icon className={color} />
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <Link href="/dashboard/courses" className="text-xs text-primary hover:underline underline-offset-4 flex items-center gap-1">
            View all <RiArrowRightLine />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl border border-border p-5 flex gap-4 animate-pulse">
                <div className="w-[68px] h-[68px] rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <RiBookOpenLine className="text-4xl text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet.</p>
            <Link href="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
              Browse Courses <RiArrowRightLine />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map(course => <EnrolledCourseCard key={course.id} course={course} />)}
          </div>
        )}
      </div>
    </div>
  );
}
