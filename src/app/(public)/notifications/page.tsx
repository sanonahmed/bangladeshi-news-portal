import { Metadata } from "next";
import { getRecentAlerts } from "@/actions/notifications";
import { NotificationCenterClient } from "@/components/public/notifications/NotificationCenterClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "পুশ নোটিফিকেশন ও ব্রেকিং অ্যালার্ট সেন্টার | দৈনিক বাংলাদেশ বার্তা",
  description:
    "ব্রেকিং নিউজ, জাতীয় ও খেলাধুলার গুরুত্বপূর্ণ খবর সরাসরি আপনার ব্রাউজারে পেতে নোটিফিকেশন সেটিংস কাস্টমাইজ করুন।",
};

export const revalidate = 60; // 1 minute ISR

export default async function NotificationsPage() {
  const features = await getFeatureFlags();
  if (features.push_notifications === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="ব্রাউজার পুশ নোটিফিকেশন"
        featureNameEn="Web Push Notifications"
        categoryName="বিজ্ঞপ্তি"
      />
    );
  }

  const alerts = await getRecentAlerts(20);

  return (
    <main className="min-h-screen bg-[var(--color-bg-secondary)]/30 py-4">
      <NotificationCenterClient initialAlerts={alerts} />
    </main>
  );
}
