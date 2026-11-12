import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";
import { AiAssistantHubClient } from "./AiAssistantHubClient";

export const metadata = {
  title: "এআই বাংলা সম্পাদকীয় সহকারী | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "স্মার্ট বাংলা শিরোনাম ও সারসংক্ষেপ জেনারেটর এবং প্রুফরিডার",
};

export const dynamic = "force-dynamic";

export default async function AdminAiAssistantPage() {
  const features = await getFeatureFlags();
  if (features.admin_ai_assistant === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="এআই সম্পাদকীয় সহকারী"
        featureNameEn="AI Editorial Assistant"
        categoryName="এডমিন টুলস"
      />
    );
  }

  return <AiAssistantHubClient />;
}
