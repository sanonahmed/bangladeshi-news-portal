"use client";

import { useState } from "react";
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  MapPin,
  Award,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  KeyRound,
  Building2,
  Briefcase,
  FileText,
  X,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import {
  type AdminUserItem,
  updateUserRole,
  toggleUserBan,
  updateStaffProfile,
  createStaffMember,
  deleteStaffMember,
} from "@/actions/users";

interface AdminUsersClientProps {
  initialUsers: AdminUserItem[];
  currentUserEmail?: string;
  currentUserRole?: string;
}

const ROLES = [
  { id: "super_admin", labelEn: "Super Admin", labelBn: "সুপার অ্যাডমিন", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300" },
  { id: "admin", labelEn: "Administrator", labelBn: "অ্যাডমিনিস্ট্রেটর", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300" },
  { id: "editor", labelEn: "Senior Editor", labelBn: "সম্পাদক", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300" },
  { id: "journalist", labelEn: "Journalist / Reporter", labelBn: "প্রতিবেদক / সাংবাদিক", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300" },
  { id: "reader", labelEn: "Registered Reader", labelBn: "পাঠক", color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300" },
];

const BUREAUS = [
  "কেন্দ্রীয় বার্তা কক্ষ",
  "ঢাকা ব্যুরো",
  "চট্টগ্রাম ব্যুরো",
  "সিলেট ব্যুরো",
  "রাজশাহী ব্যুরো",
  "খুলনা ব্যুরো",
  "বরিশাল ব্যুরো",
  "রংপুর ব্যুরো",
  "ময়মনসিংহ ব্যুরো",
  "বিশেষ আন্তর্জাতিক ডেস্ক",
];

export function AdminUsersClient({
  initialUsers,
  currentUserEmail,
  currentUserRole,
}: AdminUsersClientProps) {
  const { isEn, formatNumber, formatDateString } = useAdminLanguage();

  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [roleModalUser, setRoleModalUser] = useState<AdminUserItem | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState("");

  const [banModalUser, setBanModalUser] = useState<AdminUserItem | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserItem | null>(null);

  const [profileModalUser, setProfileModalUser] = useState<AdminUserItem | null>(null);
  const [editDesignation, setEditDesignation] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editBureau, setEditBureau] = useState("");
  const [editIsBureauChief, setEditIsBureauChief] = useState(false);

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("journalist");
  const [newStaffDesignation, setNewStaffDesignation] = useState("প্রতিবেদক");
  const [newStaffDepartment, setNewStaffDepartment] = useState("বার্তা বিভাগ");
  const [newStaffBureau, setNewStaffBureau] = useState("কেন্দ্রীয় বার্তা কক্ষ");
  const [newStaffIsChief, setNewStaffIsChief] = useState(false);

  // Statistics
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "super_admin" || u.role === "admin").length;
  const editorialCount = users.filter((u) => u.role === "editor" || u.role === "journalist").length;
  const bannedCount = users.filter((u) => u.banned).length;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.designation && u.designation.toLowerCase().includes(q)) ||
      (u.bureau && u.bureau.toLowerCase().includes(q));

    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && u.banned) ||
      (statusFilter === "active" && !u.banned);

    return matchSearch && matchRole && matchStatus;
  });

  const showNotice = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Handle Role Change
  async function handleConfirmRoleChange() {
    if (!roleModalUser || !newSelectedRole) return;
    setLoading(true);
    try {
      const res = await updateUserRole(roleModalUser.id, newSelectedRole);
      if (!res.success) {
        showNotice("error", res.error || (isEn ? "Failed to change role" : "ভূমিকা পরিবর্তন ব্যর্থ হয়েছে"));
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: newSelectedRole } : u))
        );
        showNotice(
          "success",
          isEn
            ? `Role updated to ${newSelectedRole} for ${roleModalUser.name}`
            : `${roleModalUser.name}-এর ভূমিকা সফলভাবে আপডেট করা হয়েছে`
        );
        setRoleModalUser(null);
      }
    } catch (err: any) {
      showNotice("error", err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  // 2. Handle Ban / Suspension
  async function handleConfirmBanToggle() {
    if (!banModalUser) return;
    setLoading(true);
    try {
      const res = await toggleUserBan(banModalUser.id, banReasonInput);
      if (!res.success) {
        showNotice("error", res.error || (isEn ? "Failed to update account status" : "স্ট্যাটাস আপডেট ব্যর্থ"));
      } else {
        const isBanned = Boolean(res.isBanned);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === banModalUser.id ? { ...u, banned: isBanned, banReason: isBanned ? banReasonInput : null } : u
          )
        );
        showNotice(
          "success",
          isBanned
            ? isEn
              ? `Account suspended for ${banModalUser.name}`
              : `${banModalUser.name}-এর অ্যাকাউন্ট স্থগিত করা হয়েছে`
            : isEn
            ? `Account restored for ${banModalUser.name}`
            : `${banModalUser.name}-এর অ্যাকাউন্ট সক্রিয় করা হয়েছে`
        );
        setBanModalUser(null);
        setBanReasonInput("");
      }
    } catch (err: any) {
      showNotice("error", err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  // 3. Handle Staff Profile Edit
  async function handleConfirmProfileEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileModalUser) return;
    setLoading(true);
    try {
      const res = await updateStaffProfile(profileModalUser.id, {
        designation: editDesignation,
        department: editDepartment,
        bureau: editBureau,
        isBureauChief: editIsBureauChief,
      });
      if (!res.success) {
        showNotice("error", res.error || (isEn ? "Failed to update profile" : "প্রোফাইল আপডেট ব্যর্থ"));
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === profileModalUser.id
              ? {
                  ...u,
                  designation: editDesignation,
                  department: editDepartment,
                  bureau: editBureau,
                  isBureauChief: editIsBureauChief,
                }
              : u
          )
        );
        showNotice(
          "success",
          isEn ? "Journalist profile updated successfully!" : "সাংবাদিকের প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!"
        );
        setProfileModalUser(null);
      }
    } catch (err: any) {
      showNotice("error", err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  // 4. Handle Add Staff
  async function handleCreateNewStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createStaffMember({
        name: newStaffName,
        email: newStaffEmail,
        password: newStaffPassword,
        role: newStaffRole,
        designation: newStaffDesignation,
        department: newStaffDepartment,
        bureau: newStaffBureau,
        isBureauChief: newStaffIsChief,
      });

      if (!res.success) {
        showNotice("error", res.error || (isEn ? "Failed to create staff member" : "কর্মী তৈরি ব্যর্থ হয়েছে"));
      } else {
        showNotice(
          "success",
          isEn ? "New staff member account created successfully!" : "নতুন কর্মীর অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!"
        );
        setShowAddStaffModal(false);
        // Reset form
        setNewStaffName("");
        setNewStaffEmail("");
        setNewStaffPassword("");
        // Reload or optimistic add
        window.location.reload();
      }
    } catch (err: any) {
      showNotice("error", err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  const getRoleBadge = (roleId: string) => {
    const r = ROLES.find((item) => item.id === roleId);
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
          r?.color || "bg-zinc-100 text-zinc-700 border-zinc-200"
        }`}
      >
        {isEn ? r?.labelEn || roleId : r?.labelBn || roleId}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
            <Users size={26} className="text-[var(--color-primary)]" />
            <span>{isEn ? "Staff, Journalists & Newsroom Accounts" : "ব্যবহারকারী, সাংবাদিক দল ও রোল কন্ট্রোল"}</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {isEn
              ? "Role-based access control (RBAC), journalist bureau assignments, suspension management and staff onboarding"
              : "ভূমিকাভিত্তিক পারমিশন নিয়ন্ত্রণ (RBAC), সাংবাদিক ব্যুরো নিয়োগ, অ্যাকাউন্ট স্থগিতকরণ ও নতুন কর্মী অনবোর্ডিং"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/authors"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-semibold rounded text-[var(--color-text)] transition-colors"
          >
            <span>{isEn ? "Public Authors Hub" : "পাবলিক সাংবাদিক ডিরেক্টরি"}</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={() => setShowAddStaffModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>{isEn ? "Add Staff Member" : "নতুন কর্মী যুক্ত করুন"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg border-l-4 flex items-center justify-between text-xs transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-600 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] rounded space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>{isEn ? "Total Users / Staff" : "মোট কর্মী ও ইউজার"}</span>
            <Users size={16} className="text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-black text-[var(--color-text)]">{formatNumber(totalCount)}</p>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {isEn ? "Database accounts" : "নিবন্ধিত অ্যাকাউন্ট"}
          </span>
        </div>

        <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] rounded space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-400">
            <span>{isEn ? "Admins & Super Admins" : "অ্যাডমিন ও সুপার অ্যাডমিন"}</span>
            <ShieldCheck size={16} />
          </div>
          <p className="text-2xl font-black text-[var(--color-text)]">{formatNumber(adminCount)}</p>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {isEn ? "Full administrative authority" : "পূর্ণ প্রশাসনিক ক্ষমতা"}
          </span>
        </div>

        <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] rounded space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
            <span>{isEn ? "Editors & Journalists" : "সম্পাদক ও সাংবাদিক"}</span>
            <Briefcase size={16} />
          </div>
          <p className="text-2xl font-black text-[var(--color-text)]">{formatNumber(editorialCount)}</p>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {isEn ? "Active newsroom reporters" : "নিউজ রুম কনটেন্ট টিম"}
          </span>
        </div>

        <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] rounded space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
            <span>{isEn ? "Suspended Accounts" : "স্থগিত অ্যাকাউন্ট"}</span>
            <UserX size={16} />
          </div>
          <p className="text-2xl font-black text-red-600">{formatNumber(bannedCount)}</p>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {isEn ? "Banned from publishing/login" : "লগইন ও প্রকাশনা স্থগিত"}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-[var(--color-border)] p-3 bg-[var(--color-bg)] rounded flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search by name, email, bureau..." : "নাম, ইমেইল, ব্যুরো দিয়ে খুঁজুন..."}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
            <Filter size={13} />
            <span>{isEn ? "Role:" : "ভূমিকা:"}</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="all">{isEn ? "All Roles" : "সকল ভূমিকা"}</option>
              <option value="super_admin">{isEn ? "Super Admin" : "সুপার অ্যাডমিন"}</option>
              <option value="admin">{isEn ? "Admin" : "অ্যাডমিন"}</option>
              <option value="editor">{isEn ? "Editor" : "সম্পাদক"}</option>
              <option value="journalist">{isEn ? "Journalist" : "সাংবাদিক"}</option>
              <option value="reader">{isEn ? "Reader" : "পাঠক"}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="all">{isEn ? "All Status" : "সকল অবস্থা"}</option>
              <option value="active">{isEn ? "Active" : "সক্রিয়"}</option>
              <option value="banned">{isEn ? "Suspended" : "স্থগিত"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden shadow-2xs">
        <div className="p-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
          <span>
            {isEn
              ? `Displaying ${formatNumber(filteredUsers.length)} of ${formatNumber(totalCount)} members`
              : `${formatNumber(totalCount)} জনের মধ্যে ${formatNumber(filteredUsers.length)} জন প্রদর্শিত`}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isEn ? "Database RBAC Active" : "ডাটাবেজ পারমিশন সক্রিয়"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-bg-secondary)]/60 border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">{isEn ? "Staff / Journalist" : "কর্মী / সাংবাদিক"}</th>
                <th className="p-3">{isEn ? "Designation & Bureau" : "পদবী ও ব্যুরো"}</th>
                <th className="p-3">{isEn ? "Email" : "ইমেইল"}</th>
                <th className="p-3">{isEn ? "Assigned Role" : "ভূমিকা (Role)"}</th>
                <th className="p-3 text-center">{isEn ? "Stories" : "সংবাদ"}</th>
                <th className="p-3">{isEn ? "Status" : "অবস্থা"}</th>
                <th className="p-3 text-right">{isEn ? "Actions" : "পদক্ষেপ"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-[var(--color-text-muted)]">
                    {isEn ? "No users match your search and filter criteria." : "অনুসন্ধানের সাথে কোনো ব্যবহারকারী মেলেনি।"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUserEmail && u.email.toLowerCase() === currentUserEmail.toLowerCase();

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[var(--color-bg-secondary)]/50 transition-colors ${
                        u.banned ? "bg-red-50/20 dark:bg-red-950/10" : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold flex items-center justify-center shrink-0 border border-[var(--color-primary)]/20">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-mono">
                                  {isEn ? "YOU" : "আপনি"}
                                </span>
                              )}
                            </div>
                            {u.isBureauChief && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded mt-0.5">
                                <Award className="w-2.5 h-2.5" />
                                <span>{isEn ? "Bureau Chief" : "ব্যুরো প্রধান"}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Designation & Bureau */}
                      <td className="p-3">
                        {u.designation ? (
                          <div>
                            <div className="font-medium text-[var(--color-text)]">{u.designation}</div>
                            {u.bureau && (
                              <div className="text-[10px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                <span>{u.bureau}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-faint)] italic text-[11px]">
                            {isEn ? "General account" : "সাধারণ অ্যাকাউন্ট"}
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-3 text-[var(--color-text-muted)] font-mono text-[11px]">{u.email}</td>

                      {/* Role Badge */}
                      <td className="p-3">{getRoleBadge(u.role)}</td>

                      {/* Articles Count */}
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                          {formatNumber(u.totalArticles)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {u.banned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded border border-red-300 dark:border-red-900">
                            <UserX size={10} />
                            <span>{isEn ? "Suspended" : "স্থগিত"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-900">
                            <UserCheck size={10} />
                            <span>{isEn ? "Active" : "সক্রিয়"}</span>
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Role Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRoleModalUser(u);
                              setNewSelectedRole(u.role);
                            }}
                            className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors cursor-pointer"
                            title={isEn ? "Change User Role" : "ভূমিকা পরিবর্তন করুন"}
                          >
                            <Shield size={14} />
                          </button>

                          {/* Edit Journalist Profile Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setProfileModalUser(u);
                              setEditDesignation(u.designation || "প্রতিবেদক");
                              setEditDepartment(u.department || "বার্তা বিভাগ");
                              setEditBureau(u.bureau || "কেন্দ্রীয় বার্তা কক্ষ");
                              setEditIsBureauChief(Boolean(u.isBureauChief));
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors cursor-pointer"
                            title={isEn ? "Edit Staff Details (Bureau & Title)" : "পদবী ও ব্যুরো সম্পাদনা"}
                          >
                            <Edit size={14} />
                          </button>

                          {/* Suspend / Ban Button */}
                          <button
                            type="button"
                            disabled={Boolean(isCurrent)}
                            onClick={() => {
                              setBanModalUser(u);
                              setBanReasonInput(u.banReason || "");
                            }}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isCurrent
                                ? "opacity-30 cursor-not-allowed text-zinc-400"
                                : u.banned
                                ? "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                : "text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            }`}
                            title={
                              isCurrent
                                ? isEn
                                  ? "Cannot ban yourself"
                                  : "নিজের অ্যাকাউন্ট স্থগিত করা যাবে না"
                                : u.banned
                                ? isEn
                                  ? "Restore Account"
                                  : "অ্যাকাউন্ট পুনরুদ্ধার করুন"
                                : isEn
                                ? "Suspend Account"
                                : "অ্যাকাউন্ট স্থগিত করুন"
                            }
                          >
                            {u.banned ? <UserCheck size={14} /> : <UserX size={14} />}
                          </button>

                          {/* Delete Staff Button */}
                          <button
                            type="button"
                            disabled={Boolean(isCurrent || u.role === "super_admin")}
                            onClick={() => setDeleteModalUser(u)}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isCurrent || u.role === "super_admin"
                                ? "opacity-30 cursor-not-allowed text-zinc-400"
                                : "text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40"
                            }`}
                            title={
                              isCurrent
                                ? isEn
                                  ? "Cannot delete yourself"
                                  : "নিজের অ্যাকাউন্ট মোছা যাবে না"
                                : u.role === "super_admin"
                                ? isEn
                                  ? "Cannot delete Super Admin"
                                  : "সুপার অ্যাডমিন মোছা যাবে না"
                                : isEn
                                ? "Delete Staff Account"
                                : "অ্যাকাউন্ট মুছে ফেলুন"
                            }
                          >
                            <Trash2 size={14} />
                          </button>

                          {/* Public Bio Page Link */}
                          {u.slug && (
                            <Link
                              href={`/author/${u.slug}`}
                              target="_blank"
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)] rounded transition-colors"
                              title={isEn ? "View Author Bio Page" : "বায়ো পেজ দেখুন"}
                            >
                              <ExternalLink size={13} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Role Change Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                <Shield size={16} className="text-purple-600" />
                <span>{isEn ? "Change User Role" : "ব্যবহারকারীর ভূমিকা পরিবর্তন"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-[var(--color-text)] space-y-1">
              <p>
                <span className="font-semibold text-[var(--color-text-muted)]">{isEn ? "Target Member:" : "সদস্যের নাম:"}</span>{" "}
                <span className="font-bold">{roleModalUser.name}</span> ({roleModalUser.email})
              </p>
              <p>
                <span className="font-semibold text-[var(--color-text-muted)]">{isEn ? "Current Role:" : "বর্তমান ভূমিকা:"}</span>{" "}
                <span className="font-mono font-bold text-purple-600">{roleModalUser.role}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                {isEn ? "Select New System Role:" : "নতুন ভূমিকা নির্বাচন করুন:"}
              </label>
              <div className="space-y-1.5">
                {ROLES.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      newSelectedRole === r.id
                        ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30"
                        : "border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedRole"
                      value={r.id}
                      checked={newSelectedRole === r.id}
                      onChange={(e) => setNewSelectedRole(e.target.value)}
                      className="mt-0.5 text-purple-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-[var(--color-text)]">
                        {isEn ? r.labelEn : r.labelBn}
                      </span>
                      <span className="ml-1.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                        ({r.id})
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-3.5 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded text-xs font-semibold"
              >
                {isEn ? "Cancel" : "বাতিল"}
              </button>
              <button
                type="button"
                disabled={loading || newSelectedRole === roleModalUser.role}
                onClick={handleConfirmRoleChange}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-xs font-bold transition-colors cursor-pointer"
              >
                {loading ? (isEn ? "Updating..." : "আপডেট হচ্ছে...") : isEn ? "Confirm Role Change" : "ভূমিকা পরিবর্তন নিশ্চিত করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Ban / Suspend Confirmation Modal */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                {banModalUser.banned ? (
                  <>
                    <UserCheck size={16} className="text-emerald-600" />
                    <span>{isEn ? "Restore Account Access" : "অ্যাকাউন্ট সক্রিয়করণ"}</span>
                  </>
                ) : (
                  <>
                    <UserX size={16} className="text-red-600" />
                    <span>{isEn ? "Suspend User Account" : "অ্যাকাউন্ট স্থগিতকরণ"}</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setBanModalUser(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              {banModalUser.banned
                ? isEn
                  ? `Are you sure you want to restore login and editorial privileges for ${banModalUser.name}?`
                  : `আপনি কি নিশ্চিতভাবে ${banModalUser.name}-এর অ্যাকাউন্ট পুনরায় সক্রিয় করতে চান?`
                : isEn
                ? `Suspending this account will immediately revoke all editorial access and publishing capabilities for ${banModalUser.name}.`
                : `অ্যাকাউন্ট স্থগিত করলে ${banModalUser.name} আর সিস্টেমে কোনো সংবাদ রচনা বা প্রকাশনা করতে পারবেন না।`}
            </p>

            {!banModalUser.banned && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                  {isEn ? "Suspension Reason (Optional):" : "স্থগিতের কারণ (ঐচ্ছিক):"}
                </label>
                <input
                  type="text"
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  placeholder={
                    isEn
                      ? "e.g., Editorial policy violation, compromised password"
                      : "যেমন: সম্পাদকীয় নীতিমালা লঙ্ঘন, নিরাপত্তা ইস্যু"
                  }
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs focus:outline-none"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setBanModalUser(null)}
                className="px-3.5 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded text-xs font-semibold"
              >
                {isEn ? "Cancel" : "বাতিল"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmBanToggle}
                className={`px-4 py-1.5 text-white rounded text-xs font-bold transition-colors cursor-pointer ${
                  banModalUser.banned
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading
                  ? isEn
                    ? "Processing..."
                    : "প্রক্রিয়াধীন..."
                  : banModalUser.banned
                  ? isEn
                    ? "Restore Account"
                    : "সক্রিয় করুন"
                  : isEn
                  ? "Suspend Account"
                  : "স্থগিত করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Staff Profile (Bureau, Designation, Chief) */}
      {profileModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmProfileEdit}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                <Edit size={16} className="text-blue-600" />
                <span>{isEn ? "Edit Journalist Profile" : "সাংবাদিকের পদবী ও ব্যুরো সম্পাদনা"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setProfileModalUser(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Staff Name" : "সাংবাদিকের নাম"}
                </label>
                <input
                  type="text"
                  disabled
                  value={profileModalUser.name}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs opacity-70 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Designation / Title *" : "পদবী (Designation) *"}
                </label>
                <input
                  type="text"
                  required
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  placeholder={isEn ? "e.g., Senior Reporter, Staff Correspondent" : "যেমন: সিনিয়র রিপোর্টার, বিশেষ প্রতিনিধি"}
                  className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:border-[var(--color-primary)] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Bureau Assignment" : "ব্যুরো বা কর্মস্থল"}
                </label>
                <select
                  value={editBureau}
                  onChange={(e) => setEditBureau(e.target.value)}
                  className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">{isEn ? "-- Select Bureau --" : "-- ব্যুরো নির্বাচন করুন --"}</option>
                  {BUREAUS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Department" : "বিভাগ"}
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="যেমন: বার্তা বিভাগ, ফিচার ডেস্ক"
                  className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsBureauChief}
                    onChange={(e) => setEditIsBureauChief(e.target.checked)}
                    className="rounded text-[var(--color-primary)]"
                  />
                  <span>{isEn ? "Recognize as Bureau Chief" : "ব্যুরো প্রধান হিসেবে চিহ্নিত করুন"}</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setProfileModalUser(null)}
                className="px-3.5 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded text-xs font-semibold"
              >
                {isEn ? "Cancel" : "বাতিল"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors cursor-pointer"
              >
                {loading ? (isEn ? "Saving..." : "সংরক্ষণ হচ্ছে...") : isEn ? "Save Profile" : "সংরক্ষণ করুন"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Onboard New Staff Member */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewStaff}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                <Plus size={18} className="text-[var(--color-primary)]" />
                <span>{isEn ? "Onboard New Newsroom Staff Member" : "নতুন সাংবাদিক বা কর্মী অনবোর্ডিং"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Full Name *" : "পুরো নাম *"}
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder={isEn ? "e.g. Tanvir Hasan" : "যেমন: তানভীর হাসান"}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Official Email *" : "অফিসিয়াল ইমেইল *"}
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="reporter@bangladeshbarta.com"
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Initial Password (min 8 chars) *" : "প্রাথমিক পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) *"}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Assign System Role *" : "নিউজ রুম ভূমিকা *"}
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded focus:outline-none font-semibold"
                >
                  <option value="journalist">{isEn ? "Journalist / Reporter" : "সাংবাদিক / প্রতিবেদক"}</option>
                  <option value="editor">{isEn ? "Senior Editor" : "সম্পাদক"}</option>
                  <option value="admin">{isEn ? "Administrator" : "অ্যাডমিন"}</option>
                  <option value="reader">{isEn ? "Reader" : "পাঠক"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Designation *" : "পদবী *"}
                </label>
                <input
                  type="text"
                  required
                  value={newStaffDesignation}
                  onChange={(e) => setNewStaffDesignation(e.target.value)}
                  placeholder={isEn ? "Staff Correspondent" : "স্টাফ রিপোর্টার"}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Bureau" : "ব্যুরো"}
                </label>
                <select
                  value={newStaffBureau}
                  onChange={(e) => setNewStaffBureau(e.target.value)}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded focus:outline-none"
                >
                  {BUREAUS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStaffIsChief}
                  onChange={(e) => setNewStaffIsChief(e.target.checked)}
                  className="rounded text-[var(--color-primary)]"
                />
                <span>{isEn ? "Appoint as Bureau Chief" : "ব্যুরো প্রধান হিসেবে নিয়োগ দিন"}</span>
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded text-xs font-semibold cursor-pointer"
              >
                {isEn ? "Cancel" : "বাতিল"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                {loading ? (isEn ? "Creating..." : "অ্যাকাউন্ট তৈরি হচ্ছে...") : isEn ? "Create Staff Account" : "কর্মী অ্যাকাউন্ট তৈরি করুন"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
