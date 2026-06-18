"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RiRobotLine,
  RiSaveLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { cmsService } from "@/services/cms.service";

const AI_IDENTIFIER = "ai-chatbot-context";

export default function AdminChatbotContextPage() {
  const queryClient = useQueryClient();
  const [contextText, setContextText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cms-chatbot-context"],
    queryFn: () => cmsService.getByIdentifier(AI_IDENTIFIER),
  });

  useEffect(() => {
    if (data?.data?.content) {
      setContextText(data.data.content);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      if (data?.data?.id) {
        return cmsService.update(AI_IDENTIFIER, { content, type: "Text", isActive: true });
      }
      return cmsService.create({ identifier: AI_IDENTIFIER, content, type: "Text", isActive: true });
    },
    onSuccess: () => {
      toast.success("AI chatbot context saved! The chatbot will use the new context immediately.");
      queryClient.invalidateQueries({ queryKey: ["cms-chatbot-context"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
            <RiRobotLine className="text-primary text-2xl" />
            <span>AI Chatbot Knowledge Context</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Set the source-of-truth instructions and reference material used by the Victory AI Support bot.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="h-6 w-16 bg-muted rounded animate-pulse" />
          ) : data?.data?.isActive ? (
            <span className="px-3 py-1 rounded bg-green-500/10 border border-green-500/25 text-green-500 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <RiCheckboxCircleLine /> Context Live
            </span>
          ) : (
            <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-bold flex items-center gap-1.5">
              <RiErrorWarningLine /> No Active Context
            </span>
          )}
        </div>
      </div>

      {/* Editor workspace */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Bot System Persona & Knowledge Base
          </label>
          <p className="text-xs text-muted-foreground">
            Include office hours, branch locations, service details, pricing, course descriptions, and FAQ rules.
            The model reads this entire context block during inference.
          </p>
        </div>

        {isLoading ? (
          <div className="h-[400px] rounded-xl bg-muted animate-pulse" />
        ) : (
          <div className="relative">
            <textarea
              rows={18}
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Describe your company: branches, phone numbers, services, courses, pricing…"
              className="w-full px-5 py-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y font-mono leading-relaxed text-foreground shadow-inner"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Identifier: <code className="bg-muted px-2 py-0.5 rounded text-primary font-mono font-semibold">{AI_IDENTIFIER}</code>
          </p>
          <button
            onClick={() => saveMutation.mutate(contextText)}
            disabled={saveMutation.isPending || isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/10 disabled:opacity-60"
          >
            <RiSaveLine className="text-base" />
            {saveMutation.isPending ? "Saving changes..." : "Save chatbot context"}
          </button>
        </div>
      </div>
    </div>
  );
}
