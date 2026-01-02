-- Create workshop
INSERT INTO workshops (id, name, address, mobile, email, gst_number, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Demo Workshop',
    '123 Main Street, City',
    '9876543210',
    'workshop@example.com',
    'GST123456789',
    NOW(),
    NOW()
)
RETURNING id;

-- Create user with hashed password (bcrypt hash of 'admin123')
INSERT INTO users (id, mobile, password, name, role, workshop_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '9876543210',
    '$2b$10$rKJ5VqW5vN5YqZ5YqZ5YqOqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5',
    'Workshop Admin',
    'WORKSHOP_ADMIN',
    (SELECT id FROM workshops WHERE mobile = '9876543210'),
    NOW(),
    NOW()
);
