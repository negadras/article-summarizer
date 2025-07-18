-- Create user_summaries table
CREATE TABLE IF NOT EXISTS user_summaries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_content TEXT NOT NULL,
    summary_content TEXT NOT NULL,
    key_points TEXT,
    original_word_count INTEGER NOT NULL,
    summary_word_count INTEGER NOT NULL,
    compression_ratio INTEGER NOT NULL,
    is_saved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_summaries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_user_summaries_user_id ON user_summaries(user_id);
CREATE INDEX idx_user_summaries_created_at ON user_summaries(created_at);
CREATE INDEX idx_user_summaries_is_saved ON user_summaries(is_saved);
