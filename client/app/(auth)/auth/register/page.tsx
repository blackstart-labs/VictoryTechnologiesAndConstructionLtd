"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { RiMailLine, RiLockLine, RiUserLine, RiEyeLine, RiEyeOffLine, RiGraduationCapLine } from "react-icons/ri";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      authService.register({ fullName: data.fullName, email: data.email, password: data.password }),
    onSuccess: (res) => {
      if (!res.data) { toast.error(res.message); return; }
      login(res.data);
      toast.success("Account created successfully! Welcome aboard 🎉");
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo (mobile only) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <RiGraduationCapLine className="text-primary-foreground text-xl" />
        </div>
        <span className="font-bold text-lg">BuildCraft<span className="text-primary">Academy</span></span>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Start your learning journey today — free to register
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="fullName">Full Name</label>
          <div className="relative">
            <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              {...register("fullName")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="reg-email">Email address</label>
          <div className="relative">
            <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="reg-password">Password</label>
          <div className="relative">
            <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="reg-password"
              type={showPass ? "text" : "password"}
              placeholder="Min 8 chars, uppercase, number, symbol"
              autoComplete="new-password"
              {...register("password")}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative">
            <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showPass ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20"
        >
          {mutation.isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary font-medium hover:underline underline-offset-4">
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
