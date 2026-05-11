"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MailHistoryItem = {
  id: string;
  status: string;
  recipientName: string;
  companyName: string;
  email: string;
  template: string;
  subject: string;
  cc: string[];
  messageId: string;
  errorMessage: string;
  createdAt: string | null;
  sentAt: string | null;
  updatedAt: string | null;
};

const templateLabels: Record<string, string> = {
  all: "All templates",
  normal: "Normal Invitation",
  followup: "Follow-up",
  reengage: "Re-engage",
  alumnus: "Alumnus Outreach",
  role: "Role Targeting",
  linkedin: "LinkedIn Follow-up",
};

function formatDate(dateString: string | null) {
  if (!dateString) return "Unknown date";
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusStyles(status: string) {
  if (status === "sent") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function HistoryPage() {
  const [items, setItems] = useState<MailHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [template, setTemplate] = useState("all");
  const [selectedCc, setSelectedCc] = useState<string[]>([]);
  const [olderThanMonth, setOlderThanMonth] = useState(false);
  const [sort, setSort] = useState("desc");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (template !== "all") params.set("template", template);
        selectedCc.forEach((cc) => params.append("cc", cc));
        if (olderThanMonth) params.set("olderThanMonth", "1");
        if (sort !== "desc") params.set("sort", sort);

        const response = await fetch(`/api/history?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load history");
        }

        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (fetchError: unknown) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load history";
        setError(message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [olderThanMonth, search, selectedCc, sort, template]);

  const availableCc = useMemo(() => {
    return Array.from(new Set(items.flatMap((item) => item.cc))).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "sent") acc.sent += 1;
        else if (item.status === "failed") acc.failed += 1;
        else if (item.status === "pending") acc.pending += 1;
        return acc;
      },
      { total: 0, sent: 0, failed: 0, pending: 0 }
    );
  }, [items]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Mail history
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sent mail archive</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Search sent emails, filter by template, age, or CC recipients, and review delivery metadata in one place.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to home
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-bold">{counts.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sent</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{counts.sent}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Failed</p>
            <p className="mt-2 text-3xl font-bold text-rose-600">{counts.failed}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{counts.pending}</p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recipient, company, email, subject, or message ID"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                {Object.entries(templateLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Age Filter</label>
              <button
                type="button"
                onClick={() => setOlderThanMonth((current) => !current)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  olderThanMonth
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {olderThanMonth ? "Showing mail older than 1 month" : "More than a month old"}
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">CC Filter</label>
              {selectedCc.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCc([])}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Clear CC filters
                </button>
              )}
            </div>

            {availableCc.length === 0 ? (
              <p className="text-sm text-slate-500">No CC recipients available yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableCc.map((ccAddress) => {
                  const active = selectedCc.includes(ccAddress);

                  return (
                    <button
                      key={ccAddress}
                      type="button"
                      onClick={() => {
                        setSelectedCc((current) =>
                          active ? current.filter((value) => value !== ccAddress) : [...current, ccAddress]
                        );
                      }}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {ccAddress}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-600">Loading history...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">No matching history</h2>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting the search or filter options, or send a few mails first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusStyles(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {templateLabels[item.template] || item.template}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {item.recipientName || "Unknown recipient"} - {item.companyName || "Unknown company"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">{item.email}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">Subject</p>
                      <p className="mt-1">{item.subject || "No subject stored"}</p>
                    </div>
                  </div>

                  <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Sent details</p>
                    <div className="mt-3 space-y-2">
                      <p><span className="font-medium text-slate-800">Created:</span> {formatDate(item.createdAt)}</p>
                      <p><span className="font-medium text-slate-800">Updated:</span> {formatDate(item.updatedAt)}</p>
                      <p><span className="font-medium text-slate-800">Message ID:</span> {item.messageId || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  {item.cc.map((address) => (
                    <span key={address} className="rounded-full bg-slate-100 px-3 py-1">
                      CC: {address}
                    </span>
                  ))}
                  {item.errorMessage && item.status === "failed" && (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
                      Error: {item.errorMessage}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
