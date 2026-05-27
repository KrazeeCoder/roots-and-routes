import { buildDisplayImageSet } from "./imageProxy";

const preloadedImageUrls = new Set<string>();

function resolveImageUrl(sourceUrl: string | null | undefined) {
  const trimmed = sourceUrl?.trim();
  if (!trimmed) return null;
  return buildDisplayImageSet(trimmed)?.src ?? trimmed;
}

function uniqueResolvedUrls(sourceUrls: readonly (string | null | undefined)[]) {
  return Array.from(
    new Set(
      sourceUrls
        .map(resolveImageUrl)
        .filter((url): url is string => Boolean(url)),
    ),
  );
}

function preloadSingleImage(url: string) {
  if (preloadedImageUrls.has(url)) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const image = new Image();

    const finish = () => {
      preloadedImageUrls.add(url);
      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.decoding = "async";
    image.src = url;

    if (image.complete) {
      finish();
    }
  });
}

export function areImageUrlsPreloaded(sourceUrls: readonly (string | null | undefined)[]) {
  const urls = uniqueResolvedUrls(sourceUrls);
  return urls.length === 0 || urls.every((url) => preloadedImageUrls.has(url));
}

export async function preloadImageUrls(
  sourceUrls: readonly (string | null | undefined)[],
  options: { timeoutMs?: number } = {},
) {
  const urls = uniqueResolvedUrls(sourceUrls).filter((url) => !preloadedImageUrls.has(url));
  if (urls.length === 0) return { timedOut: false };

  const timeoutMs = options.timeoutMs ?? 5000;
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<{ timedOut: true }>((resolve) => {
    timeoutId = window.setTimeout(() => resolve({ timedOut: true }), timeoutMs);
  });

  const preloadPromise = Promise.all(urls.map(preloadSingleImage)).then(() => ({ timedOut: false as const }));
  const result = await Promise.race([preloadPromise, timeoutPromise]);

  if (timeoutId) {
    window.clearTimeout(timeoutId);
  }

  return result;
}
