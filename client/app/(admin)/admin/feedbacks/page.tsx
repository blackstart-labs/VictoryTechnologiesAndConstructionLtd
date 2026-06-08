"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RiDoubleQuotesL,
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiEmotionHappyLine,
  RiEmotionSadLine,
  RiQuestionLine,
  RiPieChartLine,
} from "react-icons/ri";
import { courseService } from "@/services/course.service";
import type { FeedbackResponseDto } from "@/types";

export default function AdminFeedbacksPage() {
  const queryClient = useQueryClient();

  // Fetch admin reviews
  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedbacks"],
    queryFn: () => courseService.getAdminFeedbacks(),
  });

  const feedbacks: FeedbackResponseDto[] = data?.data ?? [];

  // Mutation to update feedback sentiment
  const updateSentimentMutation = useMutation({
    mutationFn: ({ id, sentiment }: { id: string; sentiment: string }) =>
      courseService.updateFeedbackSentiment(id, sentiment),
    onSuccess: (res) => {
      toast.success(res.message || "Review status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-feedbacks"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update review status.");
    },
  });

  // Calculate statistics for analytics
  const totalCount = feedbacks.length;
  const positiveCount = feedbacks.filter((f) => f.sentiment === "Positive").length;
  const negativeCount = feedbacks.filter((f) => f.sentiment === "Negative").length;
  const pendingCount = feedbacks.filter((f) => f.sentiment === "Pending").length;

  const handleUpdate = (id: string, sentiment: string) => {
    updateSentimentMutation.mutate({ id, sentiment });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-muted/5 min-h-screen text-foreground">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-heading">Course Feedbacks & Sentiment Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Moderate student course feedbacks. Positive reviews are shown publicly, negative reviews are collected for internal analytics.
          </p>
        </div>
      </div>

      {/* Analytics Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Feedbacks */}
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase">Total Reviews</p>
            <p className="text-2xl font-extrabold text-heading">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <RiDoubleQuotesL className="text-xl" />
          </div>
        </div>

        {/* Positive (Public) */}
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-green-600 uppercase">Positive (Public)</p>
            <p className="text-2xl font-extrabold text-green-600">{positiveCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <RiEmotionHappyLine className="text-xl" />
          </div>
        </div>

        {/* Negative (Analytics) */}
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-red-600 uppercase">Negative (Internal)</p>
            <p className="text-2xl font-extrabold text-red-600">{negativeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <RiEmotionSadLine className="text-xl" />
          </div>
        </div>

        {/* Pending Moderation */}
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-600 uppercase">Pending Moderation</p>
            <p className="text-2xl font-extrabold text-amber-600">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <RiTimeLine className="text-xl" />
          </div>
        </div>
      </div>

      {/* Main Reviews Moderation Panel */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center gap-2">
          <RiPieChartLine className="text-primary text-lg" />
          <h3 className="font-bold text-sm text-heading">Reviews Queue</h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading reviews...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <RiDoubleQuotesL className="text-5xl mx-auto mb-4 opacity-20" />
            <h4 className="font-bold text-sm mb-1">No feedbacks found</h4>
            <p className="text-xs">Student course reviews will appear here once submitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Sentiment / Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {feedbacks.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/5 transition-colors">
                    {/* Student Info */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-heading text-sm">{f.userFullName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{f.userEmail}</p>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-4 px-6 font-semibold text-muted-foreground">
                      {f.courseTitle}
                    </td>

                    {/* Comment */}
                    <td className="py-4 px-6 max-w-sm">
                      <p className="italic text-muted-foreground leading-relaxed line-clamp-3">
                        "{f.comment}"
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 mt-1 font-semibold">
                        Submitted: {new Date(f.createdAt).toLocaleString()}
                      </p>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-6 font-bold text-sm text-[#1A1A1A]">
                      {f.rating} / 5
                    </td>

                    {/* Sentiment / Status pill */}
                    <td className="py-4 px-6">
                      {f.sentiment === "Positive" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 font-bold text-[10px]">
                          <RiEmotionHappyLine /> Positive (Public)
                        </span>
                      )}
                      {f.sentiment === "Negative" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-[10px]">
                          <RiEmotionSadLine /> Negative (Internal)
                        </span>
                      )}
                      {f.sentiment === "Pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-[10px]">
                          <RiTimeLine /> Pending
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {f.sentiment !== "Positive" && (
                          <button
                            onClick={() => handleUpdate(f.id, "Positive")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-sm shadow-green-500/10"
                            title="Verify as Positive (Show on Website)"
                          >
                            <RiCheckDoubleLine /> Positive
                          </button>
                        )}
                        {f.sentiment !== "Negative" && (
                          <button
                            onClick={() => handleUpdate(f.id, "Negative")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-sm shadow-red-500/10"
                            title="Verify as Negative (Keep for Analytics)"
                          >
                            <RiCloseCircleLine /> Negative
                          </button>
                        )}
                        {f.sentiment !== "Pending" && (
                          <button
                            onClick={() => handleUpdate(f.id, "Pending")}
                            className="inline-flex items-center gap-1 px-2 px-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground font-semibold transition-all"
                            title="Reset to Pending"
                          >
                            <RiQuestionLine /> Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
