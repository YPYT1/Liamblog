-- Add profile fields
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Content stats & lifecycle
ALTER TABLE posts ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN withdrawn_at TEXT;
ALTER TABLE docs ADD COLUMN views INTEGER NOT NULL DEFAULT 0;

-- Comment enhancements
ALTER TABLE comments ADD COLUMN parent_id TEXT;
ALTER TABLE comments ADD COLUMN images TEXT;
ALTER TABLE comments ADD COLUMN updated_at TEXT;

-- Revision history
CREATE TABLE IF NOT EXISTS post_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  editor_id TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  content_html TEXT NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL,
  tags TEXT,
  category TEXT,
  series TEXT,
  pinned INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  withdrawn_at TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views, published_at);
CREATE INDEX IF NOT EXISTS idx_docs_views ON docs(views, published_at);
CREATE INDEX IF NOT EXISTS idx_post_revisions_post ON post_revisions(post_id, created_at);
