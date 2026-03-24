-- Add media_type column to posts table to support video vs image
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';
