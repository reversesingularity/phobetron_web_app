-- Setup PostgreSQL user for Phobetron
-- Run this as the postgres superuser

-- Drop existing user if it exists (to reset)
DROP USER IF EXISTS celestial_app;

-- Create user with simple password
CREATE USER celestial_app WITH PASSWORD 'celestial';

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE celestial_signs TO celestial_app;
GRANT ALL PRIVILEGES ON DATABASE celestial_signs_test TO celestial_app;

-- Grant schema privileges
\c celestial_signs
GRANT ALL PRIVILEGES ON SCHEMA public TO celestial_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO celestial_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO celestial_app;

-- Enable PostGIS if needed
CREATE EXTENSION IF NOT EXISTS postgis;

\echo 'User celestial_app created with password: celestial'
\echo 'Granted all privileges on celestial_signs database'
