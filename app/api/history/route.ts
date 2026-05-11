import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

function toSafeString(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeRecord(record: any) {
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
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
    sentAt: record.sentAt ? new Date(record.sentAt).toISOString() : null,
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection("email_history");
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim() || "";
    const template = searchParams.get("template")?.trim() || "all";
    const status = searchParams.get("status")?.trim() || "all";
    const ccFilters = searchParams
      .getAll("cc")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);
    const sort = searchParams.get("sort")?.trim() === "asc" ? 1 : -1;
    const limit = Math.min(Number(searchParams.get("limit")) || 200, 500);

    const mongoQuery: Record<string, unknown> = {};

    if (template && template !== "all") {
      mongoQuery.template = template;
    }

    if (status && status !== "all") {
      mongoQuery.status = status;
    }

    if (ccFilters.length) {
      mongoQuery.cc = {
        $in: ccFilters,
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
  } catch (error: any) {
    return Response.json(
      {
        error: "Failed to load mail history",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
