const DEFAULT_WIDTHS = [480, 768, 1080] as const;
const DEFAULT_WIDTH = 1080;

function getCloudinaryCloudName() {
  return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
}

export interface ImageProxyUrlOptions {
  width?: (typeof DEFAULT_WIDTHS)[number];
}

function normalizeHttpUrl(raw: string | null | undefined) {
  const trimmed = raw?.trim() ?? "";
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

function isCloudinaryUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

function buildCloudinaryFetchUrl(
  sourceUrl: string | null | undefined,
  options: ImageProxyUrlOptions = {},
) {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName) return null;

  const normalizedUrl = normalizeHttpUrl(sourceUrl);
  if (!normalizedUrl) return null;

  if (isCloudinaryUrl(normalizedUrl)) {
    return normalizedUrl;
  }

  const transforms = [
    "f_auto",
    "q_auto",
    "c_limit",
    "fl_progressive",
    `w_${options.width ?? DEFAULT_WIDTH}`,
  ];

  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/fetch/${transforms.join(",")}/${encodeURIComponent(normalizedUrl)}`;
}

export function buildDisplayImageSet(sourceUrl?: string | null) {
  const normalizedUrl = normalizeHttpUrl(sourceUrl);
  if (!normalizedUrl) return null;

  if (isCloudinaryUrl(normalizedUrl)) {
    return {
      src: normalizedUrl,
      srcSet: null,
    };
  }

  const src = buildCloudinaryFetchUrl(normalizedUrl);
  if (!src) return null;

  const srcSet = DEFAULT_WIDTHS
    .map((width) => {
      const variant = buildCloudinaryFetchUrl(normalizedUrl, { width });
      return variant ? `${variant} ${width}w` : null;
    })
    .filter((entry): entry is string => Boolean(entry))
    .join(", ") || null;

  return {
    src,
    srcSet,
  };
}
