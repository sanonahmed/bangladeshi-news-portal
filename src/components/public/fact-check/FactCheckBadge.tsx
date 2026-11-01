import React from "react";
import { XCircle, AlertTriangle, Scale, Cpu, CheckCircle } from "lucide-react";

export type VerdictType = "false" | "misleading" | "partially_true" | "true" | "altered_media";

interface FactCheckBadgeProps {
  verdict: VerdictType;
  size?: "sm" | "md" | "lg" | "stamp";
  className?: string;
}

export const VERDICT_METADATA: Record<
  VerdictType,
  {
    label: string;
    sublabel: string;
    colorBg: string;
    colorText: string;
    border: string;
    lightBg: string;
    Icon: React.ElementType;
  }
> = {
  false: {
    label: "মিথ্যা / ভুয়া দাবি",
    sublabel: "তথ্যটি সম্পূর্ণ ভিত্তিহীন ও অসত্য",
    colorBg: "bg-red-600",
    colorText: "text-red-600 dark:text-red-400",
    border: "border-red-600",
    lightBg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900",
    Icon: XCircle,
  },
  misleading: {
    label: "বিভ্রান্তিকর",
    sublabel: "প্রসঙ্গ বহির্ভূত বা পুরনো তথ্য",
    colorBg: "bg-amber-600",
    colorText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-600",
    lightBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900",
    Icon: AlertTriangle,
  },
  altered_media: {
    label: "সম্পাদিত / এআই ডিপফেক",
    sublabel: "সফটওয়্যার বা কৃত্রিম বুদ্ধিমত্তায় তৈরি",
    colorBg: "bg-purple-600",
    colorText: "text-purple-600 dark:text-purple-400",
    border: "border-purple-600",
    lightBg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900",
    Icon: Cpu,
  },
  partially_true: {
    label: "আংশিক সত্য",
    sublabel: "তথ্যে অতিরঞ্জন বা মিশ্রণ রয়েছে",
    colorBg: "bg-blue-600",
    colorText: "text-blue-600 dark:text-blue-400",
    border: "border-blue-600",
    lightBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900",
    Icon: Scale,
  },
  true: {
    label: "সঠিক ও সত্য",
    sublabel: "যাচাইয়ে তথ্যের সত্যতা প্রমাণিত",
    colorBg: "bg-emerald-600",
    colorText: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-600",
    lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
    Icon: CheckCircle,
  },
};

export function FactCheckBadge({ verdict, size = "md", className = "" }: FactCheckBadgeProps) {
  const config = VERDICT_METADATA[verdict] || VERDICT_METADATA.false;
  const Icon = config.Icon;

  if (size === "stamp") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 border-2 rounded-xl font-extrabold uppercase tracking-wide shadow-sm rotate-[-2deg] ${config.border} ${config.lightBg} ${className}`}
      >
        <Icon size={20} className={config.colorText} />
        <span className="text-sm sm:text-base font-black">{config.label}</span>
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-bold shadow-sm ${config.lightBg} ${className}`}
      >
        <Icon size={16} />
        <span>{config.label}</span>
      </div>
    );
  }

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${config.colorBg} ${className}`}
      >
        <Icon size={11} strokeWidth={2.5} />
        <span>{config.label}</span>
      </span>
    );
  }

  // default "md"
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm ${config.colorBg} ${className}`}
    >
      <Icon size={13} strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
}
