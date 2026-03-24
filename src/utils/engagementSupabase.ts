import { supabase } from './supabase';
import type { 
  Comment, 
  Rating, 
  Like, 
  Favorite, 
  View, 
  SpotlightEngagement, 
  SpotlightEngagementStats,
  UserSpotlightEngagement
} from '../app/types/engagement';
import { validateRequired, validateMaxLength, validateEmail } from './validation';
import { validateProfanity } from './profanityFilter';

// Get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Ratings functionality
export async function addRating(spotlightId: string, rating: number): Promise<{ success: boolean; error?: string }> {
  // Remove authentication requirement for demo
  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5' };
  }

  try {
    // For demo, use localStorage to store ratings
    const ratingKey = `spotlight_rating_${spotlightId}`;
    const existingRating = localStorage.getItem(ratingKey);
    
    if (existingRating) {
      // Update existing rating
      localStorage.setItem(ratingKey, rating.toString());
    } else {
      // Add new rating
      localStorage.setItem(ratingKey, rating.toString());
    }
    
    // Update rating count
    const countKey = `spotlight_rating_count_${spotlightId}`;
    const currentCount = parseInt(localStorage.getItem(countKey) || '0');
    const newCount = existingRating ? currentCount : currentCount + 1;
    localStorage.setItem(countKey, newCount.toString());
    
    return { success: true };
  } catch (error) {
    console.error('Error adding rating:', error);
    return { success: false, error: 'Failed to submit rating' };
  }
}

export async function removeRating(spotlightId: string): Promise<{ success: boolean; error?: string }> {
  // Remove authentication requirement for demo
  try {
    // For demo, use localStorage to remove ratings
    const ratingKey = `spotlight_rating_${spotlightId}`;
    const existingRating = localStorage.getItem(ratingKey);
    
    if (existingRating) {
      localStorage.removeItem(ratingKey);
      
      // Update rating count
      const countKey = `spotlight_rating_count_${spotlightId}`;
      const currentCount = parseInt(localStorage.getItem(countKey) || '0');
      const newCount = Math.max(0, currentCount - 1);
      localStorage.setItem(countKey, newCount.toString());
      
      return { success: true };
    }
    
    return { success: true }; // Nothing to remove
  } catch (error) {
    console.error('Error removing rating:', error);
    return { success: false, error: 'Failed to remove rating' };
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
      replies: []
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
  }
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
        is_approved: true // Auto-approve for demo
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
  // Remove authentication requirement for demo
  try {
    // Check if already liked (using localStorage for demo)
    const likedKey = `spotlight_like_${spotlightId}`;
    const isCurrentlyLiked = localStorage.getItem(likedKey) === 'true';
    
    if (isCurrentlyLiked) {
      // Remove like
      localStorage.removeItem(likedKey);
      
      // For demo, we'll use localStorage counts
      const countKey = `spotlight_like_count_${spotlightId}`;
      const currentCount = parseInt(localStorage.getItem(countKey) || '0');
      const newCount = Math.max(0, currentCount - 1);
      localStorage.setItem(countKey, newCount.toString());
      
      return { isLiked: false, totalLikes: newCount };
    } else {
      // Add like
      localStorage.setItem(likedKey, 'true');
      
      const countKey = `spotlight_like_count_${spotlightId}`;
      const currentCount = parseInt(localStorage.getItem(countKey) || '0');
      const newCount = currentCount + 1;
      localStorage.setItem(countKey, newCount.toString());
      
      return { isLiked: true, totalLikes: newCount };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { isLiked: false, totalLikes: 0, error: 'Failed to update like status' };
  }
}

// Favorites functionality
export async function toggleFavorite(spotlightId: string): Promise<{ isFavorited: boolean; totalFavorites: number; error?: string }> {
  // Remove authentication requirement for demo
  try {
    // Check if already favorited (using localStorage for demo)
    const favoritedKey = `spotlight_favorite_${spotlightId}`;
    const isCurrentlyFavorited = localStorage.getItem(favoritedKey) === 'true';
    
    if (isCurrentlyFavorited) {
      // Remove favorite
      localStorage.removeItem(favoritedKey);
      
      // For demo, we'll use localStorage counts
      const countKey = `spotlight_favorite_count_${spotlightId}`;
      const currentCount = parseInt(localStorage.getItem(countKey) || '0');
      const newCount = Math.max(0, currentCount - 1);
      localStorage.setItem(countKey, newCount.toString());
      
      return { isFavorited: false, totalFavorites: newCount };
    } else {
      // Add favorite
      localStorage.setItem(favoritedKey, 'true');
      
      const countKey = `spotlight_favorite_count_${spotlightId}`;
      const currentCount = parseInt(localStorage.getItem(countKey) || '0');
      const newCount = currentCount + 1;
      localStorage.setItem(countKey, newCount.toString());
      
      return { isFavorited: true, totalFavorites: newCount };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { isFavorited: false, totalFavorites: 0, error: 'Failed to update favorite status' };
  }
}

// Views functionality
export async function incrementViewCount(spotlightId: string): Promise<number> {
  // For demo, use localStorage
  try {
    const viewKey = `spotlight_view_count_${spotlightId}`;
    const currentViews = parseInt(localStorage.getItem(viewKey) || '0');
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
  // For demo, use localStorage instead of Supabase
  try {
    // Get user engagement from localStorage
    const likedKey = `spotlight_like_${spotlightId}`;
    const favoritedKey = `spotlight_favorite_${spotlightId}`;
    const ratingKey = `spotlight_rating_${spotlightId}`;
    
    const isLiked = localStorage.getItem(likedKey) === 'true';
    const isFavorited = localStorage.getItem(favoritedKey) === 'true';
    const userRating = localStorage.getItem(ratingKey) ? parseInt(localStorage.getItem(ratingKey)!) : null;
    
    // Get stats from localStorage
    const likeCount = parseInt(localStorage.getItem(`spotlight_like_count_${spotlightId}`) || '0');
    const favoriteCount = parseInt(localStorage.getItem(`spotlight_favorite_count_${spotlightId}`) || '0');
    const ratingCount = parseInt(localStorage.getItem(`spotlight_rating_count_${spotlightId}`) || '0');
    const viewCount = parseInt(localStorage.getItem(`spotlight_view_count_${spotlightId}`) || '0');
    
    // Calculate average rating (for demo, we'll use a simple approach)
    const averageRating = ratingCount > 0 ? 4.5 : 0; // Placeholder average
    
    const stats: SpotlightEngagementStats = {
      averageRating,
      totalRatings: ratingCount,
      totalLikes: likeCount,
      totalComments: 0, // Comments not implemented in localStorage demo
      totalFavorites: favoriteCount,
      totalViews: viewCount
    };
    
    const userEngagement: UserSpotlightEngagement = {
      hasRated: userRating !== null,
      userRating,
      hasLiked: isLiked,
      hasFavorited: isFavorited
    };
    
    return {
      spotlightId,
      stats,
      userEngagement,
      comments: [] // For demo, empty comments
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
        totalViews: 0
      },
      userEngagement: {
        hasRated: false,
        userRating: null,
        hasLiked: false,
        hasFavorited: false
      },
      comments: []
    };
  }
}

// Get user's favorited spotlights
export async function getUserFavorites(): Promise<string[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('spotlight_favorites')
      .select('spotlight_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((fav: any) => fav.spotlight_id);
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
}
