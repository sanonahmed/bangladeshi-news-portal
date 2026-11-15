"use client";

import { createArticle } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { getDivisionsWithDistricts } from "@/actions/geography";
import { StoryComposer } from "@/components/admin/editor/StoryComposer";
import { authClient } from "@/lib/auth-client";
import { hasPermission } from "@/lib/permissions";

export default function NewArticlePage() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <StoryComposer
      canPublish={hasPermission(role, "article:publish")}
      loadCategories={getCategories}
      loadDivisions={getDivisionsWithDistricts}
      onSave={createArticle}
    />
  );
}