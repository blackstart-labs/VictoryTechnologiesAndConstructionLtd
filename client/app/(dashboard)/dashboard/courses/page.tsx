"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { courseService } from "@/services/course.service";
import { progressService } from "@/services/progress.service";
import { RiArrowRightLine, RiBookOpenLine, RiTimeLine, RiTrophyLine } from "react-icons/ri";
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

function CourseCard({ course }: { course: CourseResponseDto }) {
  const { data } = useQuery({
    queryKey: ["progress", course.id],
    queryFn: () => progressService.getCourseProgress(course.id),
  });
  const progress = data?.data;
  const pct = Math.round(progress?.progressPercentage ?? 0);

  return (
    <div className="rounded-2xl border border-border bg-background p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-primary/40 hover:shadow-md transition-all group">
      <div className="flex gap-4 items-center">
        <ProgressRing pct={pct} />
        <div className="min-w-0 space-y-1">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground">{course.instructorName}</p>
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
        </div>
      </div>
      
      <Link
        href={`/learn/${course.id}`}
        className="w-full md:w-auto px-5 py-2.5 text-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 flex items-center justify-center gap-1"
      >
        {pct === 0 ? "Start Course" : pct === 100 ? "Review Material" : "Continue Learning"} <RiArrowRightLine />
      </Link>
    </div>
  );
}

export default function MyCoursesPage() {
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAll(true),
  });

  const courses: CourseResponseDto[] = coursesData?.data ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Enrolled Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your progress and access your learning materials.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border p-6 flex gap-4 animate-pulse">
              <div className="w-[68px] h-[68px] rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-lg mx-auto mt-10">
          <RiBookOpenLine className="text-5xl text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">No active enrollments</h3>
          <p className="text-sm text-muted-foreground mb-6">Explore our expert-led courses to start learning.</p>
          <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            Browse Courses <RiArrowRightLine />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      )}
    </div>
  );
}
