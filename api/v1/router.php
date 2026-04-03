<?php
// api/v1/router.php

function route_request($uri) {
    // Remove query string if present
    $path = parse_url($uri, PHP_URL_PATH);
    $parts = explode('/', trim($path, '/'));

    // Structure: /api/v1/module/action
    // Example: /api/v1/auth/login.php
    if (count($parts) >= 3 && $parts[0] === 'api' && $parts[1] === 'v1') {
        $module = $parts[2];
        $action = $parts[3] ?? 'index.php';

        // Ensure action has .php extension
        if (strpos($action, '.php') === false) {
            $action .= '.php';
        }

        $filepath = __DIR__ . "/$module/$action";
        if (file_exists($filepath)) {
            require_once $filepath;
            return;
        }
    }

    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Endpoint not found: ' . $path]);
}
?>
