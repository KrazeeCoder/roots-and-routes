import React, { useEffect, useMemo, useState } from 'react'
import { buildDisplayImageSet, buildStoragePublicUrl } from "../../../utils/imageProxy";

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  assetPath?: string | null;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string | undefined>()
  const [disableSrcSet, setDisableSrcSet] = useState(false)
  const [didTryPublicFallback, setDidTryPublicFallback] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    setDidError(false)
  }

  // Use Intersection Observer for lazy loading
  React.useEffect(() => {
    if (!imageRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
            }
            observer.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    )

    if (imageRef.complete && imageRef.naturalHeight !== 0) {
      setIsLoaded(true)
    } else {
      observer.observe(imageRef)
    }

    return () => {
      observer.disconnect()
    }
  }, [imageRef])

  const { src, alt, style, className, assetPath, srcSet, sizes, loading = 'lazy', ...rest } = props
  const transformed = buildDisplayImageSet(assetPath)
  const publicFallbackSrc = useMemo(() => buildStoragePublicUrl(assetPath) ?? undefined, [assetPath]);

  const resolvedSrc = transformed?.src ?? src
  const resolvedSrcSet = srcSet ?? transformed?.srcSet
  const resolvedSizes = sizes ?? (resolvedSrcSet ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : undefined)

  useEffect(() => {
    setDidError(false)
    setDisableSrcSet(false)
    setDidTryPublicFallback(false)
    setCurrentSrc(resolvedSrc)
  }, [resolvedSrc])

  const handleError = () => {
    if (!disableSrcSet && resolvedSrcSet) {
      setDisableSrcSet(true)
      setCurrentSrc(publicFallbackSrc ?? resolvedSrc)
      return
    }
    if (!didTryPublicFallback && publicFallbackSrc && currentSrc !== publicFallbackSrc) {
      setDidTryPublicFallback(true)
      setCurrentSrc(publicFallbackSrc)
      return
    }
    setDidError(true)
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={resolvedSrc} />
      </div>
    </div>
  ) : (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      srcSet={!disableSrcSet && currentSrc === resolvedSrc ? resolvedSrcSet : undefined}
      sizes={resolvedSizes}
      {...rest}
      onError={handleError}
    />
  )
}
