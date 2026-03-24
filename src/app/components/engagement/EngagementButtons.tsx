import { useState } from "react";
import { Heart, Star, MessageSquare, Eye } from "lucide-react";
import { toggleLike, toggleFavorite } from "../../../utils/engagementSupabase";
import type { SpotlightEngagement } from "../../../app/types/engagement";

interface EngagementButtonsProps {
  spotlightId: string;
  engagement: SpotlightEngagement;
  onUpdate: (engagement: SpotlightEngagement) => void;
  compact?: boolean;
  showRating?: boolean;
  showComments?: boolean;
  showViews?: boolean;
}

export function EngagementButtons({
  spotlightId,
  engagement,
  onUpdate,
  compact = false,
  showRating = true,
  showComments = true,
  showViews = true,
}: EngagementButtonsProps) {
  const [isUpdating, setIsUpdating] = useState({
    like: false,
    favorite: false,
  });

  const handleLike = async () => {
    if (isUpdating.like) return;
    
    setIsUpdating({ ...isUpdating, like: true });
    
    try {
      const result = await toggleLike(spotlightId);
      if (!result.error) {
        onUpdate({
          ...engagement,
          stats: {
            ...engagement.stats,
            totalLikes: result.totalLikes,
          },
          userEngagement: {
            ...engagement.userEngagement,
            hasLiked: result.isLiked,
          },
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsUpdating({ ...isUpdating, like: false });
    }
  };

  const handleFavorite = async () => {
    if (isUpdating.favorite) return;
    
    setIsUpdating({ ...isUpdating, favorite: true });
    
    try {
      const result = await toggleFavorite(spotlightId);
      if (!result.error) {
        onUpdate({
          ...engagement,
          stats: {
            ...engagement.stats,
            totalFavorites: result.totalFavorites,
          },
          userEngagement: {
            ...engagement.userEngagement,
            hasFavorited: result.isFavorited,
          },
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsUpdating({ ...isUpdating, favorite: false });
    }
  };

  const buttonBaseClasses = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200";
  const compactButtonClasses = "flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors";

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={isUpdating.like}
          className={`${compactButtonClasses} ${engagement.userEngagement.hasLiked ? "text-red-500" : ""}`}
          title={engagement.userEngagement.hasLiked ? "Unlike" : "Like"}
        >
          <Heart
            className={`w-4 h-4 ${engagement.userEngagement.hasLiked ? "fill-red-500" : ""} ${isUpdating.like ? "animate-pulse" : ""}`}
          />
          {engagement.stats.totalLikes}
        </button>

        {/* Favorite */}
        <button
          onClick={handleFavorite}
          disabled={isUpdating.favorite}
          className={`${compactButtonClasses} ${engagement.userEngagement.hasFavorited ? "text-yellow-500" : ""}`}
          title={engagement.userEngagement.hasFavorited ? "Unfavorite" : "Favorite"}
        >
          <Star
            className={`w-4 h-4 ${engagement.userEngagement.hasFavorited ? "fill-yellow-500" : ""} ${isUpdating.favorite ? "animate-pulse" : ""}`}
          />
          {engagement.stats.totalFavorites}
        </button>

        {/* Rating */}
        {showRating && engagement.stats.totalRatings > 0 && (
          <div className={compactButtonClasses}>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {engagement.stats.averageRating.toFixed(1)}
          </div>
        )}

        {/* Comments */}
        {showComments && engagement.stats.totalComments > 0 && (
          <div className={compactButtonClasses}>
            <MessageSquare className="w-4 h-4" />
            {engagement.stats.totalComments}
          </div>
        )}

        {/* Views */}
        {showViews && engagement.stats.totalViews > 0 && (
          <div className={compactButtonClasses}>
            <Eye className="w-4 h-4" />
            {engagement.stats.totalViews}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isUpdating.like}
        className={`
          ${buttonBaseClasses}
          ${engagement.userEngagement.hasLiked
            ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }
          ${isUpdating.like ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Heart
          className={`w-4 h-4 ${engagement.userEngagement.hasLiked ? "fill-red-500" : ""}`}
        />
        {engagement.stats.totalLikes} {engagement.stats.totalLikes === 1 ? "Like" : "Likes"}
      </button>

      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        disabled={isUpdating.favorite}
        className={`
          ${buttonBaseClasses}
          ${engagement.userEngagement.hasFavorited
            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }
          ${isUpdating.favorite ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Star
          className={`w-4 h-4 ${engagement.userEngagement.hasFavorited ? "fill-yellow-500" : ""}`}
        />
        {engagement.stats.totalFavorites} {engagement.stats.totalFavorites === 1 ? "Favorite" : "Favorites"}
      </button>

      {/* Rating Display */}
      {showRating && engagement.stats.totalRatings > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-gray-700">
            {engagement.stats.averageRating.toFixed(1)} ({engagement.stats.totalRatings} {engagement.stats.totalRatings === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}

      {/* Comments Display */}
      {showComments && engagement.stats.totalComments > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <MessageSquare className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            {engagement.stats.totalComments} {engagement.stats.totalComments === 1 ? "Comment" : "Comments"}
          </span>
        </div>
      )}

      {/* Views Display */}
      {showViews && engagement.stats.totalViews > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Eye className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            {engagement.stats.totalViews} {engagement.stats.totalViews === 1 ? "View" : "Views"}
          </span>
        </div>
      )}
    </div>
  );
}
