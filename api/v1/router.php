<?php
// api/v1/router.php

function route_request($uri) {
    $parts = explode('/', trim($uri, '/'));

    // Simple REST logic: /api/v1/module/action -> module/action.php
    if (count($parts) >= 3 && $parts[0] === 'api' && $parts[1] === 'v1') {
        $module = $parts[2];
        $action = $parts[3] ?? 'index';

        $filepath = __DIR__ . "/$module/$action.php";
        if (file_exists($filepath)) {
            require_once $filepath;
            return;
        }
    }

    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Endpoint not found: ' . $uri]);
}
?>
