<?php
// api/v1/trading/get_open_trades.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = validate_jwt();
    $account_id = $_GET['account_id'] ?? null;

    if (!$account_id) send_response(400, null, 'Account ID is required');

    $pdo = get_db_connection();

    try {
        // Verify ownership
        $stmt = $pdo->prepare("SELECT id FROM trading_accounts WHERE id = ? AND user_id = ?");
        $stmt->execute([$account_id, $user['id']]);
        if (!$stmt->fetch()) send_response(403, null, 'Access Denied');

        $stmt = $pdo->prepare("SELECT * FROM trades WHERE account_id = ? AND status = 'open' ORDER BY open_time DESC");
        $stmt->execute([$account_id]);
        $trades = $stmt->fetchAll();

        send_response(200, $trades);

    } catch (PDOException $e) {
        send_response(500, null, 'Database error: ' . $e->getMessage());
    }
}
?>
