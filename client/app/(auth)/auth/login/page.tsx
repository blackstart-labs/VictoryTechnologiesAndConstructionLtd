"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiGraduationCapLine } from "react-icons/ri";
import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authService.login(data),
    onSuccess: (res) => {
      if (!res.data) { toast.error(res.message); return; }
      login(res.data);
      toast.success("Welcome back! 👋");
      const role = res.data.role;
      router.push(role === "Admin" ? "/admin" : "/dashboard");
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
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in to continue to your learning dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="email">Email address</label>
          <div className="relative">
            <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline underline-offset-4">Forgot password?</Link>
          </div>
          <div className="relative">
            <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20"
        >
          {mutation.isPending ? "Signing in..." : "Sign In"}
        </button>

        {/* Demo credentials */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Demo Credentials</p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              className="text-xs text-primary hover:underline underline-offset-2"
              onClick={() => { setValue("email", "admin@buildcraft.com"); setValue("password", "Admin@123!"); }}
            >
              👑 Fill Admin
            </button>
            <button
              type="button"
              className="text-xs text-primary hover:underline underline-offset-2"
              onClick={() => { setValue("email", "student@buildcraft.com"); setValue("password", "Student@123!"); }}
            >
              🎓 Fill Student
            </button>
          </div>
        </div>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary font-medium hover:underline underline-offset-4">
          Create one for free
        </Link>
      </p>
    </div>
  );
}
