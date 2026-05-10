const IMAGE_BUCKET = "external-images";
const DEFAULT_WIDTHS = [480, 768, 1080] as const;
const DEFAULT_QUALITY = 72;

function getSupabaseUrl() {
  const base = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!base) return "";
  return base.replace(/\/+$/, "");
}

function encodeObjectPath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export interface ImageProxyUrlOptions {
  width?: number;
  quality?: number;
}

export function buildStorageRenderUrl(
  assetPath: string | null | undefined,
  options: ImageProxyUrlOptions = {},
) {
  if (!assetPath) return null;

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;

  const normalizedPath = encodeObjectPath(assetPath);
  const url = new URL(
    `${supabaseUrl}/storage/v1/render/image/public/${IMAGE_BUCKET}/${normalizedPath}`,
  );

  if (options.width && Number.isFinite(options.width)) {
    url.searchParams.set("width", String(Math.max(1, Math.trunc(options.width))));
  }

  const quality = options.quality ?? DEFAULT_QUALITY;
  url.searchParams.set("quality", String(Math.max(20, Math.min(100, Math.trunc(quality)))));
  return url.toString();
}

export function getDisplayImageUrl(assetPath?: string | null, originalUrl?: string | null) {
  return buildStorageRenderUrl(assetPath) ?? originalUrl ?? null;
}

export function buildDisplayImageSet(assetPath?: string | null) {
  if (!assetPath) return null;

  const src = buildStorageRenderUrl(assetPath, { width: DEFAULT_WIDTHS[1] });
  if (!src) return null;

  const srcSet = DEFAULT_WIDTHS
    .map((width) => {
      const variant = buildStorageRenderUrl(assetPath, { width });
      return variant ? `${variant} ${width}w` : null;
    })
    .filter((entry): entry is string => Boolean(entry))
    .join(", ");

  if (!srcSet) return null;

  return {
    src,
    srcSet,
  };
}

