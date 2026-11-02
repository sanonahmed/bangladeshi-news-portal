import { AiAssistantHubClient } from "./AiAssistantHubClient";

export const metadata = {
  title: "এআই বাংলা সম্পাদকীয় সহকারী | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "স্মার্ট বাংলা শিরোনাম ও সারসংক্ষেপ জেনারেটর এবং প্রুফরিডার",
};

export default function AdminAiAssistantPage() {
  return <AiAssistantHubClient />;
}
