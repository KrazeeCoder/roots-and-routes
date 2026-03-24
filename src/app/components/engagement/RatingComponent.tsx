import { useState } from "react";
import { Star } from "lucide-react";
import { addRating, removeRating } from "../../../utils/engagementSupabase";

interface RatingComponentProps {
  spotlightId: string;
  currentRating: number | null;
  averageRating: number;
  totalRatings: number;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  onRatingChange?: (newRating: number | null) => void;
}

export function RatingComponent({
  spotlightId,
  currentRating,
  averageRating,
  totalRatings,
  readonly = false,
  size = "md",
  showCount = true,
  onRatingChange,
}: RatingComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const containerSizeClasses = {
    sm: "gap-1",
    md: "gap-1",
    lg: "gap-2",
  };

  const handleRatingClick = async (rating: number) => {
    if (readonly || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addRating(spotlightId, rating);
      if (result.success) {
        onRatingChange?.(rating);
      } else {
        setError(result.error || "Failed to submit rating");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRating = async () => {
    if (readonly || isSubmitting || !currentRating) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await removeRating(spotlightId);
      if (result.success) {
        onRatingChange?.(null);
      } else {
        setError(result.error || "Failed to remove rating");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = readonly ? averageRating : (hoveredRating || currentRating || 0);

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const isHovered = i <= hoveredRating && !readonly;
      const isCurrent = i === currentRating && !readonly;

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => !readonly && setHoveredRating(i)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          disabled={readonly || isSubmitting}
          className={`
            transition-all duration-200 transform
            ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
            ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
          `}
          title={readonly ? `${averageRating.toFixed(1)} out of 5` : `Rate ${i} star${i > 1 ? "s" : ""}`}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
              ${isHovered && !readonly ? "text-yellow-300 fill-yellow-300" : ""}
              ${isCurrent && !readonly ? "text-yellow-500 fill-yellow-500" : ""}
              ${readonly ? "drop-shadow-sm" : ""}
            `}
          />
        </button>,
      );
    }

    return stars;
  };

  return (
    <div className="flex flex-col items-start">
      <div className={`flex items-center ${containerSizeClasses[size]}`}>
        {renderStars()}

        {!readonly && currentRating && (
          <button
            type="button"
            onClick={handleRemoveRating}
            disabled={isSubmitting}
            className="ml-2 text-xs text-[#6F7553] hover:text-red-600 transition-colors"
            title="Remove your rating"
          >
            Clear
          </button>
        )}
      </div>

      {showCount && (
        <div className="mt-2">
          {totalRatings > 0 ? (
            <span className="text-sm text-[#5B473A]">
              Average rating:{" "}
              <span className="font-semibold text-[#334233]">{averageRating.toFixed(1)} / 5</span>{" "}
              ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
            </span>
          ) : (
            <span className="text-sm text-[#5B473A]">
              Average rating: <span className="font-semibold text-[#334233]">Not yet rated</span>
            </span>
          )}
        </div>
      )}

      {!readonly && (
        <p className="mt-1 text-xs text-[#6F7553]">
          {currentRating ? `Selected score: ${currentRating} / 5` : "Select your rating"}
        </p>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-500">
          {error}
        </div>
      )}

      {isSubmitting && (
        <div className="mt-2 text-xs text-gray-500">
          Submitting...
        </div>
      )}
    </div>
  );
}
