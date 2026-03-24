-- Spotlight Ratings Table
CREATE TABLE spotlight_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spotlight_id UUID NOT NULL REFERENCES spotlights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(spotlight_id, user_id)
);

-- Spotlight Likes Table
CREATE TABLE spotlight_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spotlight_id UUID NOT NULL REFERENCES spotlights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(spotlight_id, user_id)
);

-- Spotlight Comments Table
CREATE TABLE spotlight_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spotlight_id UUID NOT NULL REFERENCES spotlights(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES spotlight_comments(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spotlight Favorites Table
CREATE TABLE spotlight_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spotlight_id UUID NOT NULL REFERENCES spotlights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(spotlight_id, user_id)
);

-- Spotlight Views Table (for tracking view counts)
CREATE TABLE spotlight_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spotlight_id UUID NOT NULL REFERENCES spotlights(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_spotlight_ratings_spotlight_id ON spotlight_ratings(spotlight_id);
CREATE INDEX idx_spotlight_ratings_user_id ON spotlight_ratings(user_id);
CREATE INDEX idx_spotlight_likes_spotlight_id ON spotlight_likes(spotlight_id);
CREATE INDEX idx_spotlight_likes_user_id ON spotlight_likes(user_id);
CREATE INDEX idx_spotlight_comments_spotlight_id ON spotlight_comments(spotlight_id);
CREATE INDEX idx_spotlight_comments_parent_id ON spotlight_comments(parent_id);
CREATE INDEX idx_spotlight_comments_is_approved ON spotlight_comments(is_approved);
CREATE INDEX idx_spotlight_favorites_spotlight_id ON spotlight_favorites(spotlight_id);
CREATE INDEX idx_spotlight_favorites_user_id ON spotlight_favorites(user_id);
CREATE INDEX idx_spotlight_views_spotlight_id ON spotlight_views(spotlight_id);

-- Row Level Security Policies
ALTER TABLE spotlight_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight_views ENABLE ROW LEVEL SECURITY;

-- Policies for ratings
CREATE POLICY "Users can view all ratings" ON spotlight_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own ratings" ON spotlight_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON spotlight_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON spotlight_ratings FOR DELETE USING (auth.uid() = user_id);

-- Policies for likes
CREATE POLICY "Users can view all likes" ON spotlight_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON spotlight_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON spotlight_likes FOR DELETE USING (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY "Users can view approved comments" ON spotlight_comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert comments" ON spotlight_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own comments" ON spotlight_comments FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own comments" ON spotlight_comments FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Policies for favorites
CREATE POLICY "Users can view all favorites" ON spotlight_favorites FOR SELECT USING (true);
CREATE POLICY "Users can insert their own favorites" ON spotlight_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON spotlight_favorites FOR DELETE USING (auth.uid() = user_id);

-- Policies for views
CREATE POLICY "Users can view all views" ON spotlight_views FOR SELECT USING (true);
CREATE POLICY "Users can insert views" ON spotlight_views FOR INSERT WITH CHECK (true);

-- Functions to get engagement stats
CREATE OR REPLACE FUNCTION get_spotlight_engagement_stats(spotlight_uuid UUID)
RETURNS TABLE (
  average_rating DECIMAL,
  total_ratings INTEGER,
  total_likes INTEGER,
  total_comments INTEGER,
  total_favorites INTEGER,
  total_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rating), 0) as average_rating,
    COALESCE(COUNT(*), 0) as total_ratings,
    (SELECT COUNT(*) FROM spotlight_likes WHERE spotlight_id = spotlight_uuid) as total_likes,
    (SELECT COUNT(*) FROM spotlight_comments WHERE spotlight_id = spotlight_uuid AND is_approved = true) as total_comments,
    (SELECT COUNT(*) FROM spotlight_favorites WHERE spotlight_id = spotlight_uuid) as total_favorites,
    (SELECT COUNT(*) FROM spotlight_views WHERE spotlight_id = spotlight_uuid) as total_views
  FROM spotlight_ratings 
  WHERE spotlight_id = spotlight_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to check user engagement
CREATE OR REPLACE FUNCTION get_user_spotlight_engagement(user_uuid UUID, spotlight_uuid UUID)
RETURNS TABLE (
  has_rated BOOLEAN,
  user_rating INTEGER,
  has_liked BOOLEAN,
  has_favorited BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM spotlight_ratings WHERE user_id = user_uuid AND spotlight_id = spotlight_uuid) as has_rated,
    (SELECT rating FROM spotlight_ratings WHERE user_id = user_uuid AND spotlight_id = spotlight_uuid LIMIT 1) as user_rating,
    EXISTS(SELECT 1 FROM spotlight_likes WHERE user_id = user_uuid AND spotlight_id = spotlight_uuid) as has_liked,
    EXISTS(SELECT 1 FROM spotlight_favorites WHERE user_id = user_uuid AND spotlight_id = spotlight_uuid) as has_favorited;
END;
$$ LANGUAGE plpgsql;
