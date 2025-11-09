"use client";
import React from "react";
import { useState } from "react";

type FormState = {
  name: string;
  company: string;
  email: string;
  poc1Name: string;
  poc1Phone: string;
  poc2Name: string;
  poc2Phone: string;
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    name: "",
    company: "",
    email: "",
    poc1Name: "",
    poc1Phone: "",
    poc2Name: "",
    poc2Phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!form.name.trim() || !form.company.trim() || !form.email.trim()) {
      return "Please provide recipient name, company and email.";
    }
    // Basic email check
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const clientValidation = validate();
    if (clientValidation) {
      setError(clientValidation);
      return;
    }

    setLoading(true);

    // Map client field `company` to server expected `companyName`.
    const payload = { ...form, companyName: form.company };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Await JSON safely
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = data?.error || data?.message || "Failed to send email";
        throw new Error(errMsg);
      }

      setSuccess("Email sent successfully to " + form.email);
      setForm({ name: "", company: "", email: "", poc1Name: "", poc1Phone: "", poc2Name: "", poc2Phone: "" });
    } catch (err: any) {
      console.error("Send Email Error:", err);
      setError(err?.message || String(err) || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
        <div className="flex items-center gap-4 p-6 bg-white">
          <img
src="https://res.cloudinary.com/shubh39/image/upload/v1741670080/ewbfrw8yxdbfzhgdegvn.png"
            alt="IIIT Ranchi Logo"
            className="w-16 h-16 object-contain rounded"
          />

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">IIIT Ranchi — Placement Mailer</h1>
            <p className="text-sm text-slate-500 mt-1">Send a formal invitation email to companies for campus placements.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Recipient Name *</span>
              <input
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="text"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Company Name *</span>
              <input
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="text"
                placeholder="e.g. Acme Corp"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
              />
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Recipient Email *</span>
            <input
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              type="email"
              placeholder="recipient@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">POC 1 Name</span>
              <input
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="text"
                placeholder="Optional"
                value={form.poc1Name}
                onChange={(e) => setForm({ ...form, poc1Name: e.target.value })}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">POC 1 Phone</span>
              <input
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.poc1Phone}
                onChange={(e) => setForm({ ...form, poc1Phone: e.target.value })}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">POC 2 Name</span>
              <input
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="text"
                placeholder="Optional"
                value={form.poc2Name}
                onChange={(e) => setForm({ ...form, poc2Name: e.target.value })}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">POC 2 Phone</span>
              <input
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.poc2Phone}
                onChange={(e) => setForm({ ...form, poc2Phone: e.target.value })}
              />
            </label>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-4 py-2 rounded-md"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
              ) : null}
              <span>{loading ? "Sending..." : "Send Email"}</span>
            </button>

            <button
              type="button"
              className="text-sm text-slate-600 underline"
              onClick={() => {
                setForm({ name: "", company: "", email: "", poc1Name: "", poc1Phone: "", poc2Name: "", poc2Phone: "" });
                setError(null);
                setSuccess(null);
              }}
            >
              Reset
            </button>
          </div>

          {error ? (
            <div className="mt-2 text-sm text-red-700 font-medium">{error}</div>
          ) : null}

          {success ? (
            <div className="mt-2 text-sm text-green-700 font-medium">{success}</div>
          ) : null}

          <div className="mt-4 text-xs text-slate-500">
            Note: Ensure SMTP credentials are provided in environment variables on the server (EMAIL_ADDRESS, EMAIL_PASSWORD). For Gmail, use an app password or OAuth.
          </div>
        </form>
      </div>
    </div>
  );
}
