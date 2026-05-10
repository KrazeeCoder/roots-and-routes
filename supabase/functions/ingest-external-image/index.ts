import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0?bundle";
import { corsHeaders } from "../_shared/cors.ts";

const BUCKET = "external-images";
const MAX_BYTES = 25 * 1024 * 1024;
const TIMEOUT_MS = 15_000;
const ALLOWED_ENTITY_TYPES = new Set([
  "resource",
  "event",
  "resource_submission",
  "event_submission",
]);
const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/x-icon": "ico",
  "image/heic": "heic",
  "image/heif": "heif",
};

interface IngestRequest {
  sourceUrl?: string;
  entityType?: string;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeHttpUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function getExtension(sourceUrl: string, contentType: string) {
  const canonicalType = contentType.split(";")[0].trim().toLowerCase();
  const known = CONTENT_TYPE_TO_EXT[canonicalType];
  if (known) return known;

  try {
    const pathname = new URL(sourceUrl).pathname;
    const suffix = pathname.split(".").pop()?.toLowerCase();
    if (suffix && /^[a-z0-9]{2,5}$/.test(suffix)) {
      return suffix;
    }
  } catch {
    // fall through to default
  }

  return "img";
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(text: string) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
}

async function fetchImageBytes(sourceUrl: string) {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(sourceUrl, {
      method: "GET",
      redirect: "follow",
      signal: abortController.signal,
    });

    if (!response.ok) {
      return { error: "Remote image URL could not be fetched.", status: 422 as const };
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("image/")) {
      return { error: "Remote URL must return an image content type.", status: 415 as const };
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BYTES) {
      return { error: "Remote image exceeds the 25MB maximum size.", status: 413 as const };
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return { error: "Remote image exceeds the 25MB maximum size.", status: 413 as const };
    }

    return {
      bytes: new Uint8Array(buffer),
      contentType: contentType.split(";")[0].trim().toLowerCase(),
      status: 200 as const,
    };
  } catch {
    return { error: "Remote image URL could not be fetched.", status: 422 as const };
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: "Missing Supabase service credentials." });
  }

  let body: IngestRequest;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Request body must be valid JSON." });
  }

  if (!body.sourceUrl || typeof body.sourceUrl !== "string") {
    return jsonResponse(400, { error: "sourceUrl is required." });
  }

  if (!body.entityType || !ALLOWED_ENTITY_TYPES.has(body.entityType)) {
    return jsonResponse(400, {
      error: "entityType must be one of resource, event, resource_submission, event_submission.",
    });
  }

  const normalizedUrl = normalizeHttpUrl(body.sourceUrl);
  if (!normalizedUrl) {
    return jsonResponse(400, { error: "sourceUrl must be a valid HTTP or HTTPS URL." });
  }

  const fetched = await fetchImageBytes(normalizedUrl);
  if ("error" in fetched) {
    return jsonResponse(fetched.status, { error: fetched.error });
  }

  const hash = await sha256(normalizedUrl);
  const ext = getExtension(normalizedUrl, fetched.contentType);
  const folder = `external/${body.entityType}`;
  const filename = `${hash}.${ext}`;
  const objectPath = `${folder}/${filename}`;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: existing, error: listError } = await adminClient.storage
    .from(BUCKET)
    .list(folder, { search: filename, limit: 1 });

  if (listError) {
    return jsonResponse(500, { error: "Could not inspect existing image assets." });
  }

  if ((existing ?? []).some((object) => object.name === filename)) {
    return jsonResponse(200, {
      assetPath: objectPath,
      sourceUrl: normalizedUrl,
      contentType: fetched.contentType,
      bytes: fetched.bytes.byteLength,
    });
  }

  const { error: uploadError } = await adminClient.storage
    .from(BUCKET)
    .upload(objectPath, fetched.bytes, {
      contentType: fetched.contentType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError && !uploadError.message.toLowerCase().includes("already exists")) {
    return jsonResponse(500, { error: "Could not store optimized image asset." });
  }

  return jsonResponse(200, {
    assetPath: objectPath,
    sourceUrl: normalizedUrl,
    contentType: fetched.contentType,
    bytes: fetched.bytes.byteLength,
  });
});

