import { useState } from "react";
import { Heart } from "lucide-react";
import { getSpotlightEngagement, toggleLike } from "../../../utils/engagementSupabase";
import type { SpotlightEngagement } from "../../../app/types/engagement";

interface EngagementButtonsProps {
  spotlightId: string;
  engagement: SpotlightEngagement;
  onUpdate: (engagement: SpotlightEngagement) => void;
  compact?: boolean;
}

export function EngagementButtons({
  spotlightId,
  engagement,
  onUpdate,
  compact = false,
}: EngagementButtonsProps) {
  const [isUpdatingLike, setIsUpdatingLike] = useState(false);

  const handleLike = async () => {
    if (isUpdatingLike) return;

    setIsUpdatingLike(true);

    try {
      const result = await toggleLike(spotlightId);
      if (result.error) {
        return;
      }

      const refreshed = await getSpotlightEngagement(spotlightId);
      onUpdate(refreshed);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsUpdatingLike(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center">
        <button
          onClick={handleLike}
          disabled={isUpdatingLike}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors ${
            engagement.userEngagement.hasLiked
              ? "text-red-600 hover:text-red-700"
              : "text-[#5B473A] hover:text-[#334233]"
          } ${isUpdatingLike ? "opacity-60 cursor-not-allowed" : ""}`}
          title={engagement.userEngagement.hasLiked ? "Unlike" : "Like"}
        >
          <Heart
            className={`h-4 w-4 ${engagement.userEngagement.hasLiked ? "fill-red-500 text-red-500" : ""} ${
              isUpdatingLike ? "animate-pulse" : ""
            }`}
          />
          <span className="font-medium">
            {engagement.stats.totalLikes} {engagement.stats.totalLikes === 1 ? "Like" : "Likes"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleLike}
        disabled={isUpdatingLike}
        className={`
          inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors
          ${engagement.userEngagement.hasLiked
            ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }
          ${isUpdatingLike ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Heart
          className={`w-4 h-4 ${engagement.userEngagement.hasLiked ? "fill-red-500" : ""}`}
        />
        {engagement.stats.totalLikes} {engagement.stats.totalLikes === 1 ? "Like" : "Likes"}
      </button>
    </div>
  );
}
