-- Initialize the database with a demo user

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_enabled BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'USER'
);

-- Create demo user (password is 'demo123')
-- The password hash is generated with BCrypt strength 10 for 'demo123'
INSERT INTO users (username, email, password, created_at, updated_at, is_enabled, role)
VALUES (
    'demo',
    'demo@example.com',
    '$2a$10$N1B6p7vjJBkKms.EaQ2EwO9iAELZi6Ro7kMrcxc480X/H/6CApI0G',
    NOW(),
    NOW(),
    true,
    'USER'
) ON CONFLICT (username) DO NOTHING;

-- Create admin user (password is 'admin123')
-- The password hash is generated with BCrypt strength 10 for 'admin123'
INSERT INTO users (username, email, password, created_at, updated_at, is_enabled, role)
VALUES (
    'admin',
    'admin@example.com',
    '$2a$10$tWnWHj56JGorMpUVlW4VpewYnUZcSqGdsoGqusWUPUKQkQ0Lv0DEy',
    NOW(),
    NOW(),
    true,
    'ADMIN'
) ON CONFLICT (username) DO NOTHING;
