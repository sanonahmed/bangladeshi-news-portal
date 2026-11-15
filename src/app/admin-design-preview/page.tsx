import { notFound } from "next/navigation";
import { DashboardPreview } from "./DashboardPreview";

export default function AdminDesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DashboardPreview />;
}
