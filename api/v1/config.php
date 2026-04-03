<?php
// api/v1/config.php

define('BASE_DIR', __DIR__);

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'vantage_user');
define('DB_PASS', getenv('DB_PASS') ?: 'vantage_pass');
define('DB_NAME', getenv('DB_NAME') ?: 'vantage_db');

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'a_very_secret_key_12345_!@#$%');
define('FINNHUB_API_KEY', getenv('FINNHUB_API_KEY') ?: 'mock_key');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Database connection
function get_db_connection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERR_MODE, PDO::ERR_MODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        send_response(500, null, "Database Connection Error");
    }
}

// Simple Response helper
function send_response($status, $data = null, $message = '') {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode([
        'success' => $status >= 200 && $status < 300,
        'data' => $data,
        'message' => $message
    ]);
    exit;
}

// Token Signing and Validation (Simple HMAC-SHA256 Implementation)
function generate_jwt($payload) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload_encoded = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$payload_encoded", JWT_SECRET, true);
    $signature_encoded = base64_encode($signature);
    return "$header.$payload_encoded.$signature_encoded";
}

function validate_jwt() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!$authHeader) send_response(401, null, 'Unauthorized: No token provided');

    $token = str_replace('Bearer ', '', $authHeader);
    $parts = explode('.', $token);
    if (count($parts) !== 3) send_response(401, null, 'Invalid token format');

    list($header, $payload, $signature) = $parts;
    $valid_signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    if ($signature !== $valid_signature) {
        send_response(401, null, 'Invalid token signature');
    }

    $decoded_payload = json_decode(base64_decode($payload), true);
    if (!$decoded_payload || ($decoded_payload['exp'] < time())) {
        send_response(401, null, 'Token expired or malformed');
    }

    return $decoded_payload;
}

function require_admin() {
    $user = validate_jwt();
    if ($user['role'] !== 'admin') send_response(403, null, 'Forbidden: Admin access required');
    return $user;
}
?>
