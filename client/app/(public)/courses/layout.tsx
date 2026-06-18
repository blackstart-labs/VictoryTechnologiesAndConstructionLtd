import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Training Courses",
  description: "Enroll in VDCBD Academy. Learn Revit, interior design, structural engineering, AutoCAD, and construction management from industry experts in Bangladesh.",
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
