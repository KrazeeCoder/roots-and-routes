const IMAGE_BUCKET = "external-images";
const DEFAULT_WIDTHS = [480, 768, 1080] as const;

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
  width?: (typeof DEFAULT_WIDTHS)[number];
}

function toVariantPath(assetPath: string, width: (typeof DEFAULT_WIDTHS)[number]) {
  const lastDotIndex = assetPath.lastIndexOf(".");
  if (lastDotIndex <= 0) return null;

  const base = assetPath.slice(0, lastDotIndex);
  return `${base}_w${width}.webp`;
}

export function buildStorageRenderUrl(
  assetPath: string | null | undefined,
  options: ImageProxyUrlOptions = {},
) {
  if (!assetPath || !options.width) return null;
  const variantPath = toVariantPath(assetPath, options.width);
  if (!variantPath) return null;
  return buildStoragePublicUrl(variantPath);
}

export function buildStoragePublicUrl(assetPath: string | null | undefined) {
  if (!assetPath) return null;

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;

  const normalizedPath = encodeObjectPath(assetPath);
  return `${supabaseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${normalizedPath}`;
}

export function getDisplayImageUrl(assetPath?: string | null, originalUrl?: string | null) {
  return buildStoragePublicUrl(assetPath) ?? originalUrl ?? null;
}

export function buildDisplayImageSet(assetPath?: string | null) {
  if (!assetPath) return null;

  const src = buildStoragePublicUrl(assetPath);
  if (!src || !assetPath.endsWith(".webp")) return null;

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
