import { notFound } from "next/navigation";
import { StoryComposerPreview } from "./StoryComposerPreview";

export default function StoryDesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StoryComposerPreview />;
}