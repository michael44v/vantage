<?php
// api/v1/user/get_dashboard_data.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = validate_jwt();
    $pdo = get_db_connection();

    try {
        // Fetch wallet balance and KYC status
        $stmt = $pdo->prepare("SELECT wallet_balance, kyc_status FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $user_info = $stmt->fetch();

        // Fetch trading accounts with plan details
        $stmt = $pdo->prepare("
            SELECT ta.*, p.name as plan_name, p.leverage, p.commission
            FROM trading_accounts ta
            JOIN plans p ON ta.plan_id = p.id
            WHERE ta.user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $accounts = $stmt->fetchAll();

        send_response(200, [
            'wallet_balance' => (float)$user_info['wallet_balance'],
            'kyc_status' => $user_info['kyc_status'],
            'trading_accounts' => $accounts
        ]);

    } catch (PDOException $e) {
        send_response(500, null, 'Database error: ' . $e->getMessage());
    }
}
?>
