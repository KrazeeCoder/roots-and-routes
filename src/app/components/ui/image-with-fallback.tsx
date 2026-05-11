import React, { useEffect, useState } from 'react'
import { buildDisplayImageSet } from "../../../utils/imageProxy";

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const imageRef = React.useRef<HTMLImageElement>(null)
  const [didError, setDidError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string | undefined>()
  const [disableSrcSet, setDisableSrcSet] = useState(false)
  const [didTryOriginalFallback, setDidTryOriginalFallback] = useState(false)

  const { src, alt, style, className, srcSet, sizes, ...rest } = props
  const originalSrc = typeof src === "string" ? src : undefined
  const transformed = buildDisplayImageSet(originalSrc)

  const resolvedSrc = transformed?.src ?? originalSrc
  const resolvedSrcSet = srcSet ?? transformed?.srcSet ?? undefined
  const resolvedSizes = sizes ?? (resolvedSrcSet ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : undefined)

  useEffect(() => {
    setDidError(false)
    setDisableSrcSet(false)
    setDidTryOriginalFallback(false)
    setCurrentSrc(resolvedSrc)
  }, [resolvedSrc, originalSrc])

  const handleError = () => {
    if (!disableSrcSet && resolvedSrcSet) {
      setDisableSrcSet(true)
      setCurrentSrc(resolvedSrc)
      return
    }
    if (!didTryOriginalFallback && originalSrc && currentSrc !== originalSrc) {
      setDidTryOriginalFallback(true)
      setCurrentSrc(originalSrc)
      return
    }
    setDidError(true)
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
      role="img"
      aria-label={alt || "Image failed to load"}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={resolvedSrc} />
      </div>
    </div>
  ) : (
    <img
      ref={imageRef}
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      srcSet={!disableSrcSet && currentSrc === resolvedSrc ? resolvedSrcSet : undefined}
      sizes={resolvedSizes}
      loading="lazy"
      {...rest}
      onError={handleError}
    />
  )
}
