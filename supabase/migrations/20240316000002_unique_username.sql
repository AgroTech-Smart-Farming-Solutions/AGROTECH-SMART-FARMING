-- Ensure usernames are unique in the profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_username') THEN
        ALTER TABLE profiles ADD CONSTRAINT unique_username UNIQUE (username);
    END IF;
END $$;
