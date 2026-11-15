type LoginError = {
  status?: number;
  code?: string;
  message?: string;
};

/** Do not mislabel network/server failures as invalid credentials. */
export function getLoginErrorMessage(error?: LoginError): string {
  if (error?.status === 429) {
    return "অনেকবার লগইন করার চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।";
  }
  if (error?.status && error.status >= 500) {
    return "লগইন সেবা সাময়িকভাবে অনুপলব্ধ। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (error?.code === "INVALID_EMAIL_OR_PASSWORD" || error?.status === 401) {
    return "ইমেইল বা পাসওয়ার্ড সঠিক নয়";
  }
  return error?.message || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}
