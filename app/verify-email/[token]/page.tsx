"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (data.success) {
          setStatus("✅ Email verified successfully! Redirecting to login...");
          setTimeout(() => router.push("/"), 2500);
        } else {
          setStatus("❌ Invalid or expired verification link.");
        }
      } catch (error) {
        setStatus("⚠️ Something went wrong during verification.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Email Verification</h1>
        <p className="text-gray-600">{status}</p>
        {loading && <div className="mt-4 animate-pulse text-orange-500">Please wait...</div>}
      </div>
    </div>
  );
}
