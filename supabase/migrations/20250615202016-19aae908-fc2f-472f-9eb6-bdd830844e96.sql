
-- Insert admin user if it doesn't already exist
INSERT INTO users (
  email,
  first_name,
  last_name,
  role,
  approved,
  blocked
) 
VALUES (
  'billyblun17@gmail.com',
  'Admin',
  'User',
  'admin',
  true,
  false
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  approved = true,
  blocked = false;
