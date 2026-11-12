import { getFeatureFlags } from "@/actions/features";
import { AdminFeaturesClient } from "./AdminFeaturesClient";

export const dynamic = "force-dynamic";

export default async function AdminFeaturesPage() {
  const flags = await getFeatureFlags();

  return <AdminFeaturesClient initialFlags={flags} />;
}
