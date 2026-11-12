import type { Metadata } from "next";
import { getAuthorsList } from "@/actions/authors";
import { AuthorsDirectoryClient } from "./AuthorsDirectoryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "আমাদের সাংবাদিক ও বার্তা দল | দৈনিক বাংলাদেশ বার্তা",
  description:
    "দৈনিক বাংলাদেশ বার্তার সম্পাদকীয় পরিষদ, অনুসন্ধানী প্রতিবেদক, বিশেষ প্রতিনিধি ও বিভাগীয় ব্যুরো প্রধানদের পরিচিতি ও প্রতিবেদন তালিকা।",
};

export default async function AuthorsDirectoryPage() {
  const authors = await getAuthorsList();

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <AuthorsDirectoryClient authors={authors} />
    </div>
  );
}
