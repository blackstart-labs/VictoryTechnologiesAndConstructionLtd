import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Structural & Architectural Projects",
  description: "Browse the architectural blueprints, structural design projects, and completed commercial/residential landmarks developed by VDCBD.",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
