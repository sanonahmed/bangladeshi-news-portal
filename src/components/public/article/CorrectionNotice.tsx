import { AlertCircle } from "lucide-react";
import { formatBengaliDateTime } from "@/lib/bengali-date";

interface CorrectionNoticeProps {
  note: string;
  date?: Date | null;
}

export function CorrectionNotice({ note, date }: CorrectionNoticeProps) {
  return (
    <div className="border-l-4 border-amber-600 bg-amber-50 dark:bg-amber-950/40 p-4 my-6">
      <div className="flex items-start gap-2.5">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
            সম্পাদকীয় সংশোধনী বিজ্ঞপ্তি
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            {note}
          </p>
          {date && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              সংশোধনের সময়: {formatBengaliDateTime(date)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
