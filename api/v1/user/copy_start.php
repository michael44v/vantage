<?php
// api/v1/user/copy_start.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = validate_jwt(); // Secure extraction of user context
    $data = json_decode(file_get_contents('php://input'), true);

    $provider_account_id = $data['provider_account_id'] ?? null;
    $copier_account_id = $data['copier_account_id'] ?? null;

    if (!$provider_account_id || !$copier_account_id) {
        send_response(400, null, 'Provider and Copier accounts are required');
    }

    $pdo = get_db_connection();

    try {
        // Secure Ownership Check: Does the copier account belong to the authenticated user?
        $stmt = $pdo->prepare("SELECT id FROM trading_accounts WHERE id = ? AND user_id = ?");
        $stmt->execute([$copier_account_id, $user['id']]);
        if (!$stmt->fetch()) send_response(403, null, 'Forbidden: You can only set up copying for your own account');

        // Prevent self-copying
        $stmt = $pdo->prepare("SELECT user_id FROM trading_accounts WHERE id = ?");
        $stmt->execute([$provider_account_id]);
        $provider_user_id = $stmt->fetchColumn();
        if ($provider_user_id == $user['id']) send_response(400, null, 'You cannot copy your own account');

        $stmt = $pdo->prepare("INSERT INTO copy_trading (provider_account_id, copier_account_id, status) VALUES (?, ?, 'active') ON DUPLICATE KEY UPDATE status = 'active'");
        $stmt->execute([$provider_account_id, $copier_account_id]);

        send_response(200, null, 'Successfully started copying trader');
    } catch (PDOException $e) {
        send_response(500, null, 'Database error: ' . $e->getMessage());
    }
}
?>
