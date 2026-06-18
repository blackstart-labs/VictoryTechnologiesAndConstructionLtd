import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Victory Design & Construction Ltd (VDCBD), our design philosophy, and our structural engineering and architectural excellence in Bangladesh.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
