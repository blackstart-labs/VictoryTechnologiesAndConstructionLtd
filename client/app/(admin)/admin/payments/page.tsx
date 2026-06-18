"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RiShieldCheckLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiExchangeLine,
  RiCoinsLine,
  RiArrowGoBackLine,
  RiLoader2Line,
} from "react-icons/ri";
import { paymentService } from "@/services/progress.service";

type TabType = "pending" | "approved" | "refunded";

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  // Fetch all payment records for verification
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments-history"],
    queryFn: () => paymentService.getAllPayments(),
  });

  const payments = data?.data ?? [];

  // Sort latest transactions at the top
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Mutation to approve enrollment payment
  const approveMutation = useMutation({
    mutationFn: (id: string) => paymentService.approvePayment(id),
    onSuccess: (res) => {
      toast.success(res.message || "Payment verified & Student enrolled successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-payments-history"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve payment verification.");
    },
  });

  // Mutation to refund payment
  const refundMutation = useMutation({
    mutationFn: (id: string) => paymentService.refundPayment(id),
    onSuccess: (res) => {
      toast.success(res.message || "Payment status marked as Refunded and enrollment removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-payments-history"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to process refund.");
    },
  });

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("en-US")} TK`;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-bold">
            <RiCheckboxCircleLine className="text-sm" /> Verified
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold">
            <RiArrowGoBackLine className="text-sm" /> Refunded
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold animate-pulse">
            <RiTimeLine className="text-sm" /> Pending Approval
          </span>
        );
    }
  };

  // Filter payments by Tab
  const filteredPayments = sortedPayments.filter((p: any) => {
    const status = p.status?.toLowerCase();
    if (activeTab === "pending") {
      return status === "pending";
    }
    if (activeTab === "approved") {
      return status === "success" || status === "approved";
    }
    if (activeTab === "refunded") {
      return status === "refunded";
    }
    return false;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-[#FAFAFA] min-h-screen">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Payment & Enrollment Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review manual transactions, verify student course fees, and manage refunds.
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <RiShieldCheckLine className="text-base" /> Secure CMS Admin Gate
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border gap-6">
        {(["pending", "approved", "refunded"] as TabType[]).map((tab) => {
          const count = sortedPayments.filter((p) => {
            const status = p.status?.toLowerCase();
            if (tab === "pending") return status === "pending";
            if (tab === "approved") return status === "success" || status === "approved";
            if (tab === "refunded") return status === "refunded";
            return false;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all capitalize flex items-center gap-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab === "pending" ? "Pending Approval" : tab}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content list */}
      <div className="rounded-2xl border border-border/80 bg-background shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <RiExchangeLine className="text-5xl text-muted-foreground/30" />
            <h3 className="font-bold text-lg text-foreground">No transaction records</h3>
            <p className="text-xs text-muted-foreground">
              No payments match this status filter at this time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-bold tracking-wider">
                  <th className="p-4">Student Details</th>
                  <th className="p-4">Training Target</th>
                  <th className="p-4">Method & Account</th>
                  <th className="p-4">Transaction Reference</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-muted/10 transition-colors">
                    {/* Student Name & Email */}
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <RiUserLine className="text-primary text-sm shrink-0" />
                        {payment.userFullName || "Student Partner"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <RiMailLine className="text-muted-foreground shrink-0" />
                        {payment.userEmail || "N/A"}
                      </div>
                    </td>

                    {/* Training TARGET */}
                    <td className="p-4 space-y-1 font-semibold text-foreground">
                      <div className="line-clamp-1">{payment.courseTitle || "Professional Training"}</div>
                      <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                        <RiCoinsLine className="text-sm text-primary shrink-0" />
                        {formatPrice(payment.amount || 0)}
                      </div>
                    </td>

                    {/* Method & Phone */}
                    <td className="p-4 space-y-1">
                      <span className="px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                        {payment.paymentMethod}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                        <RiPhoneLine className="shrink-0" />
                        {payment.phoneNumber || "N/A"}
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="p-4 font-mono font-bold text-foreground text-xs uppercase tracking-wider">
                      {payment.transactionId}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {getStatusBadge(payment.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {payment.status?.toLowerCase() === "pending" && (
                          <button
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate(payment.id)}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-sm shadow-primary/15 disabled:opacity-60 flex items-center gap-1"
                          >
                            {approveMutation.isPending && (
                              <RiLoader2Line className="animate-spin text-sm" />
                            )}
                            Approve
                          </button>
                        )}

                        {(payment.status?.toLowerCase() === "success" ||
                          payment.status?.toLowerCase() === "approved") && (
                          <button
                            disabled={refundMutation.isPending}
                            onClick={() => {
                              if (confirm("Are you sure you want to mark this transaction as refunded? This will revoke the student's course access.")) {
                                refundMutation.mutate(payment.id);
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-sm disabled:opacity-60 flex items-center gap-1"
                          >
                            {refundMutation.isPending && (
                              <RiLoader2Line className="animate-spin text-sm" />
                            )}
                            <RiArrowGoBackLine className="text-sm" />
                            Refund
                          </button>
                        )}

                        {payment.status?.toLowerCase() === "refunded" && (
                          <span className="text-xs text-muted-foreground font-medium italic">Refunded</span>
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
