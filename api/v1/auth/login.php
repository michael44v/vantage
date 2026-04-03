<?php
// api/v1/auth/login.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['email']) || empty($data['password'])) {
        send_response(400, null, 'Email and password are required');
    }

    $pdo = get_db_connection();
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if ($user && password_verify($data['password'], $user['password'])) {
        $payload = [
            'id' => $user['id'],
            'role' => $user['role'],
            'email' => $user['email'],
            'exp' => time() + 86400 // 24 hours
        ];
        $token = generate_jwt($payload);

        send_response(200, ['token' => $token, 'user' => ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]], 'Login successful');
    } else {
        send_response(401, null, 'Invalid credentials');
    }
}
?>
