"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

const DEFAULT_CC = "incharge.tpc@iiitranchi.ac.in";

const templateLabels: Record<string, string> = {
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

function daysSince(dateString: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<MailHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Record<string, string>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const loadFollowUps = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        olderThanMonth: "1",
        sort: "asc",
        limit: "500",
      });
      if (search.trim()) params.set("q", search.trim());

      const response = await fetch(`/api/history?${params.toString()}`, { signal });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load follow-up queue");
      }

      const records = Array.isArray(data?.items) ? (data.items as MailHistoryItem[]) : [];
      setItems(
        records.filter((item) => item.status === "sent" && item.template !== "followup")
      );
    } catch (fetchError: unknown) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load follow-up queue";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void loadFollowUps(controller.signal);
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [loadFollowUps]);

  const counts = useMemo(() => {
    const due = items.length;
    const sentThisSession = Object.keys(sentIds).length;
    return { due, sentThisSession };
  }, [items, sentIds]);

  const sendFollowUp = async (item: MailHistoryItem) => {
    if (sendingId || sentIds[item.id]) return;

    setSendingId(item.id);
    setCardErrors((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });

    const selectedContacts = item.cc
      .map((address) => address.trim())
      .filter((address) => address && address.toLowerCase() !== DEFAULT_CC);

    const age = daysSince(item.createdAt || item.sentAt);
    const previousInteraction =
      age != null
        ? `about our placement invitation sent ${age} day${age === 1 ? "" : "s"} ago`
        : "about our earlier placement invitation";

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.recipientName,
          company: item.companyName,
          companyName: item.companyName,
          email: item.email,
          template: "followup",
          previousInteraction,
          selectedContacts,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || data?.details || "Failed to send follow-up");
      }

      setSentIds((current) => ({
        ...current,
        [item.id]: data?.message || "Follow-up sent successfully",
      }));
    } catch (sendError: unknown) {
      const message = sendError instanceof Error ? sendError.message : "Failed to send follow-up";
      setCardErrors((current) => ({ ...current, [item.id]: message }));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_35%),linear-gradient(180deg,_#fffaf5_0%,_#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-orange-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(154,52,18,0.35)] backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Follow-up queue
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mails older than a month</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              One-click follow-ups for invitations that have gone quiet. We reuse the original recipient,
              company, and CC list with the follow-up template.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/history"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open History
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to home
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Due for follow-up</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">{counts.due}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sent this session</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{counts.sentThisSession}</p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search queue</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient, company, email, or subject"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
            <p className="mt-4 text-sm text-slate-600">Loading follow-up queue...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">No follow-ups due</h2>
            <p className="mt-2 text-sm text-slate-600">
              There are no successfully sent invitations older than one month right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => {
              const age = daysSince(item.createdAt || item.sentAt);
              const alreadySent = Boolean(sentIds[item.id]);
              const isSending = sendingId === item.id;
              const cardError = cardErrors[item.id];

              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
                    alreadySent
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 hover:-translate-y-0.5 hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                          {age != null ? `${age} days ago` : "Older than 1 month"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {templateLabels[item.template] || item.template}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {item.recipientName || "Unknown recipient"} — {item.companyName || "Unknown company"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">{item.email}</p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-medium text-slate-900">Original subject</p>
                        <p className="mt-1">{item.subject || "No subject stored"}</p>
                        <p className="mt-3 text-xs text-slate-500">
                          Originally sent: {formatDate(item.createdAt || item.sentAt)}
                        </p>
                      </div>

                      {item.cc.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {item.cc.map((address) => (
                            <span key={address} className="rounded-full bg-slate-100 px-3 py-1">
                              CC: {address}
                            </span>
                          ))}
                        </div>
                      )}

                      {alreadySent && (
                        <p className="text-sm font-medium text-emerald-700">
                          {sentIds[item.id]}
                        </p>
                      )}
                      {cardError && (
                        <p className="text-sm font-medium text-rose-700">{cardError}</p>
                      )}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => void sendFollowUp(item)}
                        disabled={alreadySent || isSending || Boolean(sendingId)}
                        className={`rounded-2xl px-5 py-4 text-sm font-semibold shadow-sm transition ${
                          alreadySent
                            ? "cursor-not-allowed border border-emerald-200 bg-emerald-100 text-emerald-800"
                            : isSending
                              ? "cursor-wait border border-orange-200 bg-orange-100 text-orange-800"
                              : "border border-orange-600 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                        }`}
                      >
                        {alreadySent ? "Follow-up sent" : isSending ? "Sending follow-up..." : "Send follow-up"}
                      </button>
                      <p className="text-xs leading-relaxed text-slate-500">
                        Sends the follow-up template to the same recipient and restores the original CC list.
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
