INSERT INTO users (id, email, username, password, name, status, tokenVersion, createdAt, updatedAt)
VALUES ('cm1superadmin001', 'admin@komuna.id', 'superadmin', '$2a$12$LJ3m4ys4Lk0TSwHjmz0k8OQHk3B3ZxYqj5Qv5Qv5Qv5Qv5Qv5Qv5Q', 'Super Admin', 'ACTIVE', 0, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO user_roles (id, userId, role, createdAt)
VALUES ('cm1superadmin001_role', 'cm1superadmin001', 'SUPER_ADMIN', NOW(3))
ON DUPLICATE KEY UPDATE role = 'SUPER_ADMIN';
