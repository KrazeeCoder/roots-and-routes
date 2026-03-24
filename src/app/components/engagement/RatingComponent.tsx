import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { addRating, getRatingReason } from "../../../utils/engagementSupabase";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

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

function clampStarFill(value: number, starIndex: number) {
  const fill = (value - starIndex) * 100;
  return Math.max(0, Math.min(100, fill));
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(currentRating ?? 0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const averageLabel = useMemo(() => {
    if (totalRatings === 0) return "Not yet rated";
    return `${averageRating.toFixed(1)} / 5`;
  }, [averageRating, totalRatings]);

  const ratingCountLabel = useMemo(() => {
    if (!showCount) return null;
    return `(${totalRatings} ${totalRatings === 1 ? "rating" : "ratings"})`;
  }, [showCount, totalRatings]);

  const openDialog = () => {
    setSelectedRating(currentRating ?? 0);
    setReason(getRatingReason(spotlightId) ?? "");
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmitRating = async () => {
    if (readonly || isSubmitting) return;

    if (selectedRating < 1 || selectedRating > 5) {
      setError("Please choose a rating from 1 to 5.");
      return;
    }

    if (!reason.trim()) {
      setError("Please include a short reason for your rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addRating(spotlightId, selectedRating, reason.trim());
      if (result.success) {
        onRatingChange?.(selectedRating);
        setIsDialogOpen(false);
      } else {
        setError(result.error || "Failed to submit rating.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6F7553]">
          Average
        </span>
        <div className="inline-flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, starIndex) => {
            const fillPercent = clampStarFill(averageRating, starIndex);
            return (
              <span key={starIndex} className="relative inline-flex">
                <Star className={`${sizeClasses[size]} text-[#D4C4B0]`} />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercent}%` }}
                >
                  <Star className={`${sizeClasses[size]} fill-[#B36A4C] text-[#B36A4C]`} />
                </span>
              </span>
            );
          })}
        </div>
        <span className="text-sm font-semibold text-[#334233]">{averageLabel}</span>
        {ratingCountLabel ? <span className="text-xs text-[#6F7553]">{ratingCountLabel}</span> : null}
        {!readonly ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openDialog}
            className="ml-1 h-7 px-3 text-xs border-[#D8C9AF] text-[#334233] hover:border-[#B36A4C] hover:text-[#B36A4C]"
          >
            Rate
          </Button>
        ) : null}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-[#E7D9C3] bg-[#F6F1E7] text-[#334233]">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond',serif] text-2xl text-[#334233]">
              Rate This Listing
            </DialogTitle>
            <DialogDescription className="text-[#6F7553]">
              Choose a score and share a short reason for your rating.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-[#334233]">Your score</p>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  const isFilled = starValue <= selectedRating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setSelectedRating(starValue)}
                      className="transition-transform hover:scale-110"
                      aria-label={`Rate ${starValue} out of 5`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          isFilled ? "fill-[#B36A4C] text-[#B36A4C]" : "text-[#D4C4B0]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#334233]">Reason</p>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Briefly explain your rating..."
                className="min-h-24 border-[#D8C9AF] bg-white text-[#334233] placeholder:text-[#8F8F7A]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-[#D8C9AF] text-[#334233]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleSubmitRating();
              }}
              disabled={isSubmitting}
              className="bg-[#334233] hover:bg-[#B36A4C] text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
