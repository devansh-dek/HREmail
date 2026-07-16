import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

function toSafeString(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function toIsoDateString(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type HistoryRecord = {
  _id: unknown;
  status?: unknown;
  recipientName?: unknown;
  companyName?: unknown;
  email?: unknown;
  template?: unknown;
  subject?: unknown;
  cc?: unknown;
  messageId?: unknown;
  errorMessage?: unknown;
  createdAt?: unknown;
  sentAt?: unknown;
  updatedAt?: unknown;
};

function serializeRecord(record: HistoryRecord) {
  return {
    id: record._id instanceof ObjectId ? record._id.toString() : toSafeString(record._id),
    status: toSafeString(record.status || "sent"),
    recipientName: toSafeString(record.recipientName),
    companyName: toSafeString(record.companyName),
    email: toSafeString(record.email),
    template: toSafeString(record.template || "normal"),
    subject: toSafeString(record.subject),
    cc: Array.isArray(record.cc) ? record.cc.map((item: unknown) => toSafeString(item)).filter(Boolean) : [],
    messageId: toSafeString(record.messageId),
    errorMessage: toSafeString(record.errorMessage),
    createdAt: toIsoDateString(record.createdAt),
    sentAt: toIsoDateString(record.sentAt),
    updatedAt: toIsoDateString(record.updatedAt),
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection("email_history");
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim() || "";
    const template = searchParams.get("template")?.trim() || "all";
    const ccFilters = searchParams
      .getAll("cc")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);
    const olderThanMonth = searchParams.get("olderThanMonth") === "1";
    const sort = searchParams.get("sort")?.trim() === "asc" ? 1 : -1;
    const limit = Math.min(Number(searchParams.get("limit")) || 200, 500);

    const mongoQuery: Record<string, unknown> = {};

    if (template && template !== "all") {
      mongoQuery.template = template;
    }

    if (ccFilters.length) {
      mongoQuery.cc = {
        $in: ccFilters,
      };
    }

    if (olderThanMonth) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 1);
      mongoQuery.createdAt = {
        $lt: cutoff,
      };
    }

    if (query) {
      const escaped = escapeRegex(query);
      mongoQuery.$or = [
        { recipientName: { $regex: escaped, $options: "i" } },
        { companyName: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { subject: { $regex: escaped, $options: "i" } },
        { template: { $regex: escaped, $options: "i" } },
        { messageId: { $regex: escaped, $options: "i" } },
        { errorMessage: { $regex: escaped, $options: "i" } },
        { cc: { $regex: escaped, $options: "i" } },
      ];
    }

    const records = await collection
      .find(mongoQuery)
      .sort({ createdAt: sort, _id: sort })
      .limit(limit)
      .toArray();

    return Response.json({
      items: records.map(serializeRecord),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        error: "Failed to load mail history",
        details: message,
      },
      { status: 500 }
    );
  }
}
