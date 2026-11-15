"use client";

import { useState } from "react";
import type { createArticle } from "@/actions/articles";
import type { CategoryItem } from "@/actions/categories";
import type { DivisionWithDistricts } from "@/actions/geography";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { StoryComposer } from "@/components/admin/editor/StoryComposer";

const loadCategories = async (): Promise<CategoryItem[]> => [
  { id: "preview-national", name: "জাতীয়", nameEn: "National", slug: "national", sortOrder: 1, isActive: true, showInNav: true },
  { id: "preview-politics", name: "রাজনীতি", nameEn: "Politics", slug: "politics", sortOrder: 2, isActive: true, showInNav: true },
];
const loadDivisions = async (): Promise<DivisionWithDistricts[]> => [
  { id: "preview-dhaka", name: "ঢাকা", nameEn: "Dhaka", slug: "dhaka", sortOrder: 1, districts: [
    { id: "preview-gazipur", name: "গাজীপুর", nameEn: "Gazipur", slug: "gazipur", divisionId: "preview-dhaka", sortOrder: 1 },
  ] },
  { id: "preview-sylhet", name: "সিলেট", nameEn: "Sylhet", slug: "sylhet", sortOrder: 2, districts: [] },
];

export function StoryComposerPreview() {
  const [canPublish, setCanPublish] = useState(true);
  const [payload, setPayload] = useState<Parameters<typeof createArticle>[0] | null>(null);

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900">
        <p>Design preview · Sample data only. No stories will be saved or published.</p>
        <label className="flex items-center gap-2">Preview role
          <select aria-label="Preview role" className="rounded border p-1" value={canPublish ? "editor" : "journalist"} onChange={event => setCanPublish(event.target.value === "editor")}>
            <option value="editor">Editor</option><option value="journalist">Journalist</option>
          </select>
        </label>
      </div>
      <StoryComposer canPublish={canPublish} loadCategories={loadCategories} loadDivisions={loadDivisions} storageKey="barta_preview_story_draft"
        onSave={async data => {
          setPayload(data);
          return { success: false, error: "Preview only — no story was saved or published." };
        }} />
      <output data-testid="preview-story-payload" hidden>{JSON.stringify(payload)}</output>
    </AdminShell>
  );
}