import {
  getAllAdminAlerts,
  getAdminNotificationStats,
  getAdminPushSubscribers,
} from "@/actions/notifications";
import { AdminNotificationsClient } from "./AdminNotificationsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ওয়েব পুশ নোটিফিকেশন সেন্টার | অ্যাডমিন প্যানেল",
  description:
    "ব্রেকিং নিউজ ও গুরুত্বপূর্ণ ফ্যাক্ট-চেক পাঠকদের ডিভাইসে ইনস্ট্যান্ট ব্রাউজার পুশ নোটিফিকেশন প্রেরণের কন্ট্রোল রুম।",
};

export default async function AdminNotificationsPage() {
  const [alerts, stats, subscribers] = await Promise.all([
    getAllAdminAlerts(),
    getAdminNotificationStats(),
    getAdminPushSubscribers(),
  ]);

  return (
    <AdminNotificationsClient
      initialAlerts={alerts}
      stats={stats}
      subscribers={subscribers}
    />
  );
}
