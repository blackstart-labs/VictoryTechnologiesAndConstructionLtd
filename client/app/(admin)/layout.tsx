"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  RiGraduationCapLine,
  RiDashboardLine,
  RiBookOpenLine,
  RiBuildingLine,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiHomeLine,
  RiShieldCheckLine,
  RiUserLine,
  RiBriefcaseLine,
  RiDoubleQuotesL,
  RiRobotLine,
  RiCloseLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: RiDashboardLine },
  { label: "Verify Payments", href: "/admin/payments", icon: RiShieldCheckLine },
  { label: "Manage Courses", href: "/admin/courses", icon: RiBookOpenLine },
  { label: "Manage Projects", href: "/admin/projects", icon: RiBuildingLine },
  { label: "Manage Reviews", href: "/admin/feedbacks", icon: RiDoubleQuotesL },
  { label: "Manage Careers", href: "/admin/careers", icon: RiBriefcaseLine },
  { label: "Chatbot Context", href: "/admin/chatbot-context", icon: RiRobotLine },
  { label: "Manage Users", href: "/admin/users", icon: RiUserLine },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      toast.error("Please log in to access the Admin Panel.");
      router.replace("/auth/login");
      return;
    }

    if (user?.role !== "Admin") {
      toast.error("Access denied. Admin role required.");
      router.replace("/dashboard");
    }
  }, [mounted, isAuthenticated, user, router]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!mounted || !isAuthenticated || user?.role !== "Admin") return null;

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Admin Sidebar (Desktop/Tablet) */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-border bg-background z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/logo-transparent.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              VDCBD<span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>

        {/* User Info Badge */}
        <div className="px-4 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user?.fullName}</p>
              <span className="inline-block px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNavItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                pathname === href
                  ? "bg-primary/10 text-primary border border-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="text-lg shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 space-y-1 border-t border-border pt-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <RiHomeLine className="text-lg" /> Back to Main Site
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/");
              toast.success("Successfully logged out.");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all text-left"
          >
            <RiLogoutBoxLine className="text-lg" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open navigation menu"
          >
            <RiGraduationCapLine className="text-xl text-primary" />
          </button>
          <span className="font-bold text-sm text-foreground">VDCBD Admin</span>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
            toast.success("Successfully logged out.");
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
        >
          Logout
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 w-72 bg-background border-r border-border z-50 flex flex-col transition-transform duration-300 ease-in-out transform",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <img
              src="/logo-transparent.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-sm tracking-tight text-foreground">
              VDCBD<span className="text-primary">Admin</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <RiCloseLine className="text-lg" />
          </button>
        </div>

        {/* User Info Badge */}
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user?.fullName}</p>
              <span className="inline-block px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {adminNavItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                pathname === href
                  ? "bg-primary/10 text-primary border border-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="text-lg shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-4 pb-6 space-y-1 border-t border-border pt-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <RiHomeLine className="text-lg" /> Back to Main Site
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
              router.push("/");
              toast.success("Successfully logged out.");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all text-left"
          >
            <RiLogoutBoxLine className="text-lg" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 md:ml-64">
        <div className="pt-14 md:pt-0 pb-8 md:pb-0 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
