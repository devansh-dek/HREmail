"use client";
import React from "react";
import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    poc1Name: "",
    poc1Phone: "",
    poc2Name: "",
    poc2Phone: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Map client field `company` to server expected `companyName`.
    const payload = { ...form, companyName: form.company };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = data?.error || data?.message || "Failed to send email";
        throw new Error(errMsg);
      }

      alert("✅ Email Sent Successfully!");
    } catch (err: any) {
      console.error("Send Email Error:", err);
      alert("❌ Error sending email: " + (err?.message || err));
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96 space-y-3"
      >
        <h2 className="text-xl font-semibold text-center">Send T&P Mail</h2>

        <input className="border p-2 w-full" type="text"
          placeholder="Recipient Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input className="border p-2 w-full" type="text"
          placeholder="Company Name"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />

        <input className="border p-2 w-full" type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* POC Fields */}
        <input className="border p-2 w-full" type="text"
          placeholder="POC 1 Name (optional)"
          value={form.poc1Name}
          onChange={(e) => setForm({ ...form, poc1Name: e.target.value })}
        />

        <input className="border p-2 w-full" type="text"
          placeholder="POC 1 Phone (optional)"
          value={form.poc1Phone}
          onChange={(e) => setForm({ ...form, poc1Phone: e.target.value })}
        />

        <input className="border p-2 w-full" type="text"
          placeholder="POC 2 Name (optional)"
          value={form.poc2Name}
          onChange={(e) => setForm({ ...form, poc2Name: e.target.value })}
        />

        <input className="border p-2 w-full" type="text"
          placeholder="POC 2 Phone (optional)"
          value={form.poc2Phone}
          onChange={(e) => setForm({ ...form, poc2Phone: e.target.value })}
        />

        <button className="bg-blue-600 text-white p-2 w-full rounded">
          Send Email
        </button>
      </form>
    </div>
  );
}
