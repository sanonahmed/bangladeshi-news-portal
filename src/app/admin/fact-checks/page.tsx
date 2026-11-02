import { getFactChecks, getFactCheckSubmissions } from "@/actions/fact-checks";
import { AdminFactChecksClient } from "./AdminFactChecksClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ফ্যাক্ট-চেক ও ভুয়া খবর প্রতিরোধ কর্নার | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "সামাজিক মাধ্যমে ভাইরাল তথ্যের সত্যতা যাচাই ও পাঠক দাবি ইনবক্স",
};

export default async function AdminFactChecksPage() {
  const [factChecks, submissions] = await Promise.all([
    getFactChecks(),
    getFactCheckSubmissions(),
  ]);

  return (
    <AdminFactChecksClient
      initialFactChecks={factChecks}
      initialSubmissions={submissions}
    />
  );
}
