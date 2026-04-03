<?php
// api/v1/auth/register.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['email']) || empty($data['password']) || empty($data['full_name'])) {
        send_response(400, null, 'Email, password, and full name are required');
    }

    $pdo = get_db_connection();

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        send_response(400, null, 'Email already registered');
    }

    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, 'user')");
        $stmt->execute([$data['email'], $hashedPassword, $data['full_name']]);
        $user_id = $pdo->lastInsertId();

        send_response(201, ['user_id' => $user_id], 'Registration successful');
    } catch (PDOException $e) {
        send_response(500, null, 'Database error: ' . $e->getMessage());
    }
}
?>
