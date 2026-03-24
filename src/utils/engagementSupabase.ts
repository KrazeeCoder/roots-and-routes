import { supabase } from './supabase';
import type {
  Comment,
  SpotlightEngagement,
  SpotlightEngagementStats,
  UserSpotlightEngagement,
} from '../app/types/engagement';
import { validateRequired, validateMaxLength, validateEmail } from './validation';
import { validateProfanity } from './profanityFilter';

interface ResourceEngagementRow {
  average_rating: number | string | null;
  total_ratings: number | string | null;
  total_likes: number | string | null;
  user_rating: number | string | null;
  user_has_liked: boolean | null;
  user_reason: string | null;
}

interface ToggleLikeRow {
  is_liked: boolean | null;
  total_likes: number | string | null;
}

const ratingReasonCache = new Map<string, string>();

function firstRow<T>(data: T[] | T | null): T | null {
  if (!data) return null;
  return Array.isArray(data) ? data[0] ?? null : data;
}

function toInt(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloat(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeReason(reason: string | null | undefined): string | null {
  const trimmed = reason?.trim();
  return trimmed ? trimmed : null;
}

async function fetchResourceEngagementRow(spotlightId: string): Promise<ResourceEngagementRow | null> {
  const { data, error } = await supabase.rpc('get_resource_engagement', {
    p_resource_id: spotlightId,
  });

  if (error) throw error;
  return firstRow<ResourceEngagementRow>(data as ResourceEngagementRow[] | ResourceEngagementRow | null);
}

// Get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Ratings functionality
export async function addRating(
  spotlightId: string,
  rating: number,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5' };
  }

  const cleanedReason = reason?.trim() ?? '';
  if (!cleanedReason) {
    return { success: false, error: 'Please include a short reason for your rating.' };
  }

  try {
    const { error } = await supabase.rpc('upsert_resource_rating', {
      p_resource_id: spotlightId,
      p_rating: rating,
      p_reason: cleanedReason,
    });

    if (error) throw error;

    ratingReasonCache.set(spotlightId, cleanedReason);
    return { success: true };
  } catch (error) {
    console.error('Error adding rating:', error);
    return { success: false, error: 'Failed to submit rating' };
  }
}

export async function removeRating(spotlightId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('remove_resource_rating', {
      p_resource_id: spotlightId,
    });

    if (error) throw error;

    const row = firstRow<ResourceEngagementRow>(data as ResourceEngagementRow[] | ResourceEngagementRow | null);
    const userReason = normalizeReason(row?.user_reason);
    if (userReason) {
      ratingReasonCache.set(spotlightId, userReason);
    } else {
      ratingReasonCache.delete(spotlightId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing rating:', error);
    return { success: false, error: 'Failed to remove rating' };
  }
}

export async function getRatingReason(spotlightId: string): Promise<string | null> {
  if (ratingReasonCache.has(spotlightId)) {
    return ratingReasonCache.get(spotlightId) ?? null;
  }

  try {
    const row = await fetchResourceEngagementRow(spotlightId);
    const userReason = normalizeReason(row?.user_reason);
    if (userReason) {
      ratingReasonCache.set(spotlightId, userReason);
    }

    return userReason;
  } catch (error) {
    console.error('Error loading rating reason:', error);
    return null;
  }
}

// Comments functionality
export async function getComments(spotlightId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('spotlight_comments')
      .select('*')
      .eq('spotlight_id', spotlightId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((comment: any) => ({
      id: comment.id,
      spotlightId: comment.spotlight_id,
      userId: comment.user_id,
      authorName: comment.author_name,
      authorEmail: comment.author_email,
      content: comment.content,
      parentId: comment.parent_id,
      isApproved: comment.is_approved,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      replies: [],
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function addComment(
  spotlightId: string,
  commentData: {
    authorName: string;
    authorEmail?: string;
    content: string;
    parentId?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();

  // Validate comment data
  const nameError = validateRequired(commentData.authorName, 'Author name');
  if (nameError) return { success: false, error: nameError };

  const nameLengthError = validateMaxLength(commentData.authorName, 'Author name', 100);
  if (nameLengthError) return { success: false, error: nameLengthError };

  if (commentData.authorEmail) {
    const emailError = validateEmail(commentData.authorEmail);
    if (emailError) return { success: false, error: emailError };
  }

  const contentError = validateRequired(commentData.content, 'Comment');
  if (contentError) return { success: false, error: contentError };

  const contentLengthError = validateMaxLength(commentData.content, 'Comment', 1000);
  if (contentLengthError) return { success: false, error: contentLengthError };

  const profanityError = validateProfanity(commentData.authorName, 'Author name');
  if (profanityError) return { success: false, error: profanityError };

  const contentProfanityError = validateProfanity(commentData.content, 'Comment');
  if (contentProfanityError) return { success: false, error: contentProfanityError };

  try {
    const { error } = await supabase
      .from('spotlight_comments')
      .insert({
        spotlight_id: spotlightId,
        user_id: userId,
        author_name: commentData.authorName,
        author_email: commentData.authorEmail,
        content: commentData.content,
        parent_id: commentData.parentId,
        is_approved: true, // Auto-approve for demo
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to submit comment' };
  }
}

// Likes functionality
export async function toggleLike(spotlightId: string): Promise<{ isLiked: boolean; totalLikes: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('toggle_resource_like', {
      p_resource_id: spotlightId,
    });

    if (error) throw error;

    const row = firstRow<ToggleLikeRow>(data as ToggleLikeRow[] | ToggleLikeRow | null);
    return {
      isLiked: Boolean(row?.is_liked),
      totalLikes: toInt(row?.total_likes, 0),
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { isLiked: false, totalLikes: 0, error: 'Failed to update like status' };
  }
}

// Favorites functionality
export async function toggleFavorite(spotlightId: string): Promise<{ isFavorited: boolean; totalFavorites: number; error?: string }> {
  // Favorites are not part of the current engagement model.
  return { isFavorited: false, totalFavorites: 0, error: `Favorite is not available for ${spotlightId}` };
}

// Views functionality
export async function incrementViewCount(spotlightId: string): Promise<number> {
  // Views remain local-only for demo telemetry.
  try {
    const viewKey = `spotlight_view_count_${spotlightId}`;
    const currentViews = Number.parseInt(localStorage.getItem(viewKey) || '0', 10);
    const newViews = currentViews + 1;
    localStorage.setItem(viewKey, newViews.toString());
    return newViews;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return 0;
  }
}

export async function getViewCount(spotlightId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('spotlight_views')
      .select('*', { count: 'exact', head: true })
      .eq('spotlight_id', spotlightId);

    return count || 0;
  } catch (error) {
    console.error('Error getting view count:', error);
    return 0;
  }
}

// Get comprehensive engagement data
export async function getSpotlightEngagement(spotlightId: string): Promise<SpotlightEngagement> {
  try {
    const row = await fetchResourceEngagementRow(spotlightId);

    const userReason = normalizeReason(row?.user_reason);
    if (userReason) {
      ratingReasonCache.set(spotlightId, userReason);
    } else {
      ratingReasonCache.delete(spotlightId);
    }

    const userRating = row?.user_rating === null || row?.user_rating === undefined
      ? null
      : toInt(row.user_rating, 0);

    const stats: SpotlightEngagementStats = {
      averageRating: toFloat(row?.average_rating, 0),
      totalRatings: toInt(row?.total_ratings, 0),
      totalLikes: toInt(row?.total_likes, 0),
      totalComments: 0,
      totalFavorites: 0,
      totalViews: 0,
    };

    const userEngagement: UserSpotlightEngagement = {
      hasRated: userRating !== null,
      userRating,
      hasLiked: Boolean(row?.user_has_liked),
      hasFavorited: false,
    };

    return {
      spotlightId,
      stats,
      userEngagement,
      comments: [],
    };
  } catch (error) {
    console.error('Error getting spotlight engagement:', error);
    return {
      spotlightId,
      stats: {
        averageRating: 0,
        totalRatings: 0,
        totalLikes: 0,
        totalComments: 0,
        totalFavorites: 0,
        totalViews: 0,
      },
      userEngagement: {
        hasRated: false,
        userRating: null,
        hasLiked: false,
        hasFavorited: false,
      },
      comments: [],
    };
  }
}

// Favorites are currently disabled, so this always returns an empty list.
export async function getUserFavorites(): Promise<string[]> {
  return [];
}
