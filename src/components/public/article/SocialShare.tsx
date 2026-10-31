"use client";

import { useState } from "react";
import { Link2, Share2, Printer, Check } from "lucide-react";
import { FacebookIcon, TwitterXIcon, LinkedinIcon, WhatsAppIcon } from "@/components/ui/icons";

interface SocialShareProps {
  url: string;
  title: string;
  showLabel?: boolean;
}

export function SocialShare({ url, title, showLabel }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shares = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookIcon,
      color: "hover:text-[#1877F2]",
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: WhatsAppIcon,
      color: "hover:text-[#25D366]",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: TwitterXIcon,
      color: "hover:text-black dark:hover:text-white",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedinIcon,
      color: "hover:text-[#0A66C2]",
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          <Share2 size={14} />
          <span>শেয়ার:</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        {shares.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.name}-এ শেয়ার করুন`}
            className={`p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors ${s.color}`}
          >
            <s.icon size={14} />
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="লিঙ্ক কপি করুন"
          className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          title={copied ? "কপি সম্পন্ন!" : "লিঙ্ক কপি"}
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
        </button>
        <button
          onClick={handlePrint}
          aria-label="প্রিন্ট করুন"
          className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors no-print"
          title="প্রিন্ট"
        >
          <Printer size={14} />
        </button>
      </div>
    </div>
  );
}
