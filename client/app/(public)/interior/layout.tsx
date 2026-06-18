import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interior Design Services",
  description: "Transform your residential and commercial spaces. Premium modern interior design, renovation, and styling solutions by VDCBD designers.",
};

export default function InteriorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
