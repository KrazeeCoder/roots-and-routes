import type { Comment, Like, Favorite, SpotlightEngagement, UserEngagement } from '../app/types/engagement';
import { validateProfanity, validateRequired, validateMaxLength, validateEmail } from './validation';

// Mock storage for demo purposes - in production, this would connect to a backend
const STORAGE_KEYS = {
  COMMENTS: 'spotlight_comments',
  LIKES: 'spotlight_likes', 
  FAVORITES: 'spotlight_favorites',
  VIEWS: 'spotlight_views',
  USER_ENGAGEMENT: 'user_engagement'
};

// Generate a simple user ID for demo purposes
function getCurrentUserId(): string {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_id', userId);
  }
  return userId;
}

// Comments functionality
export function getComments(spotlightId: string): Comment[] {
  const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]');
  return comments
    .filter((comment: Comment) => comment.spotlightId === spotlightId && comment.isApproved)
    .sort((a: Comment, b: Comment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'isApproved'>): { success: boolean; error?: string } {
  // Validate comment data
  const nameError = validateRequired(commentData.authorName, 'Author name');
  if (nameError) return { success: false, error: nameError };
  
  const nameLengthError = validateMaxLength(commentData.authorName, 50, 'Author name');
  if (nameLengthError) return { success: false, error: nameLengthError };
  
  if (commentData.authorEmail) {
    const emailError = validateEmail(commentData.authorEmail);
    if (emailError) return { success: false, error: emailError };
  }
  
  const contentError = validateRequired(commentData.content, 'Comment');
  if (contentError) return { success: false, error: contentError };
  
  const contentLengthError = validateMaxLength(commentData.content, 500, 'Comment');
  if (contentLengthError) return { success: false, error: contentLengthError };
  
  const profanityError = validateProfanity(commentData.authorName, 'Author name');
  if (profanityError) return { success: false, error: profanityError };
  
  const contentProfanityError = validateProfanity(commentData.content, 'Comment');
  if (contentProfanityError) return { success: false, error: contentProfanityError };

  const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]');
  const newComment: Comment = {
    ...commentData,
    id: 'comment_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    isApproved: true // Auto-approve for demo, in production this might require moderation
  };
  
  comments.push(newComment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  
  return { success: true };
}

// Likes functionality
export function toggleLike(spotlightId: string): { isLiked: boolean; totalLikes: number } {
  const userId = getCurrentUserId();
  const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || '[]');
  
  const existingLikeIndex = likes.findIndex((like: Like) => 
    like.spotlightId === spotlightId && like.userId === userId
  );
  
  let isLiked: boolean;
  if (existingLikeIndex >= 0) {
    // Remove like
    likes.splice(existingLikeIndex, 1);
    isLiked = false;
  } else {
    // Add like
    likes.push({
      id: 'like_' + Math.random().toString(36).substr(2, 9),
      spotlightId,
      userId,
      createdAt: new Date().toISOString()
    });
    isLiked = true;
  }
  
  localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
  const totalLikes = likes.filter((like: Like) => like.spotlightId === spotlightId).length;
  
  return { isLiked, totalLikes };
}

export function getLikeCount(spotlightId: string): number {
  const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || '[]');
  return likes.filter((like: Like) => like.spotlightId === spotlightId).length;
}

export function isLikedByUser(spotlightId: string): boolean {
  const userId = getCurrentUserId();
  const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || '[]');
  return likes.some((like: Like) => like.spotlightId === spotlightId && like.userId === userId);
}

// Favorites functionality
export function toggleFavorite(spotlightId: string): { isFavorited: boolean; totalFavorites: number } {
  const userId = getCurrentUserId();
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  
  const existingFavoriteIndex = favorites.findIndex((favorite: Favorite) => 
    favorite.spotlightId === spotlightId && favorite.userId === userId
  );
  
  let isFavorited: boolean;
  if (existingFavoriteIndex >= 0) {
    // Remove favorite
    favorites.splice(existingFavoriteIndex, 1);
    isFavorited = false;
  } else {
    // Add favorite
    favorites.push({
      id: 'favorite_' + Math.random().toString(36).substr(2, 9),
      spotlightId,
      userId,
      createdAt: new Date().toISOString()
    });
    isFavorited = true;
  }
  
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  const totalFavorites = favorites.filter((favorite: Favorite) => favorite.spotlightId === spotlightId).length;
  
  return { isFavorited, totalFavorites };
}

export function getFavoriteCount(spotlightId: string): number {
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  return favorites.filter((favorite: Favorite) => favorite.spotlightId === spotlightId).length;
}

export function isFavoritedByUser(spotlightId: string): boolean {
  const userId = getCurrentUserId();
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  return favorites.some((favorite: Favorite) => favorite.spotlightId === spotlightId && favorite.userId === userId);
}

// Views functionality
export function incrementViewCount(spotlightId: string): number {
  const views = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWS) || '{}');
  views[spotlightId] = (views[spotlightId] || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify(views));
  return views[spotlightId];
}

export function getViewCount(spotlightId: string): number {
  const views = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWS) || '{}');
  return views[spotlightId] || 0;
}

// Get comprehensive engagement data
export function getSpotlightEngagement(spotlightId: string): SpotlightEngagement {
  const userId = getCurrentUserId();
  
  return {
    spotlightId,
    likeCount: getLikeCount(spotlightId),
    commentCount: getComments(spotlightId).length,
    favoriteCount: getFavoriteCount(spotlightId),
    viewCount: getViewCount(spotlightId),
    isLikedByUser: isLikedByUser(spotlightId),
    isFavoritedByUser: isFavoritedByUser(spotlightId),
    comments: getComments(spotlightId)
  };
}

// Get user's favorited spotlights
export function getUserFavorites(): string[] {
  const userId = getCurrentUserId();
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  return favorites
    .filter((favorite: Favorite) => favorite.userId === userId)
    .map((favorite: Favorite) => favorite.spotlightId);
}
