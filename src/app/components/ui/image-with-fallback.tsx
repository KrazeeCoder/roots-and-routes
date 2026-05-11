import React, { useState } from 'react'
import { buildDisplayImageSet } from "../../../utils/imageProxy";

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  assetPath?: string | null;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)

  const handleError = () => {
    setDidError(true)
    setIsLoaded(false)
  }

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

  const resolvedSrc = transformed?.src ?? src
  const resolvedSrcSet = srcSet ?? transformed?.srcSet
  const resolvedSizes = sizes ?? (resolvedSrcSet ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : undefined)

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
    <div className="relative">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
      )}
      <img
        ref={setImageRef}
        data-src={resolvedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className ?? ''}`}
        style={style}
        srcSet={resolvedSrcSet}
        sizes={resolvedSizes}
        loading={loading}
        decoding="async"
        {...rest}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}
