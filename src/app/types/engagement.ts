export interface Comment {
  id: string;
  spotlightId: string;
  userId?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  parentId?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
}

export interface Rating {
  id: string;
  spotlightId: string;
  userId: string;
  rating: number; // 1-5 scale
  createdAt: string;
  updatedAt?: string;
}

export interface Like {
  id: string;
  spotlightId: string;
  userId: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  spotlightId: string;
  userId: string;
  createdAt: string;
}

export interface View {
  id: string;
  spotlightId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SpotlightEngagementStats {
  averageRating: number;
  totalRatings: number;
  totalLikes: number;
  totalComments: number;
  totalFavorites: number;
  totalViews: number;
}

export interface UserSpotlightEngagement {
  hasRated: boolean;
  userRating: number | null;
  hasLiked: boolean;
  hasFavorited: boolean;
}

export interface SpotlightEngagement {
  spotlightId: string;
  stats: SpotlightEngagementStats;
  userEngagement: UserSpotlightEngagement;
  comments: Comment[];
}

export interface UserEngagement {
  userId: string;
  likedSpotlights: string[];
  favoritedSpotlights: string[];
  ratedSpotlights: string[];
  comments: Comment[];
}
