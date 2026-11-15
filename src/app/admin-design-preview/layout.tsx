import type { Metadata } from "next";
import { AdminLanguageProvider } from "@/contexts/AdminLanguageContext";
import "./preview.css";

export const metadata: Metadata = {
  title: "Admin design preview",
  robots: { index: false, follow: false },
};
export default function AdminDesignPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLanguageProvider>{children}</AdminLanguageProvider>;
}
