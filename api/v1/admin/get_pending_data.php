<?php
// api/v1/admin/get_pending_data.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_admin();

    $pdo = get_db_connection();

    try {
        // Fetch pending KYC
        $stmt = $pdo->prepare("
            SELECT kd.*, u.email as user_email, u.full_name
            FROM kyc_documents kd
            JOIN users u ON kd.user_id = u.id
            WHERE kd.status = 'pending'
            ORDER BY kd.submitted_at DESC
        ");
        $stmt->execute();
        $kyc = $stmt->fetchAll();

        // Fetch pending manual withdrawals/deposits
        $stmt = $pdo->prepare("
            SELECT t.*, u.email as user_email
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE t.status = 'pending' AND t.method = 'manual'
            ORDER BY t.created_at DESC
        ");
        $stmt->execute();
        $transactions = $stmt->fetchAll();

        // Real System stats
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users");
        $stmt->execute();
        $total_users = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM trading_accounts");
        $stmt->execute();
        $total_accounts = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE type = 'deposit' AND status = 'completed'");
        $stmt->execute();
        $total_deposits = (float)$stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT SUM(pnl) FROM trades WHERE status = 'closed'");
        $stmt->execute();
        $total_pnl = (float)$stmt->fetchColumn();

        send_response(200, [
            'kyc' => $kyc,
            'transactions' => $transactions,
            'stats' => [
                'total_users' => $total_users,
                'total_accounts' => $total_accounts,
                'total_deposits' => $total_deposits ?: 0,
                'platform_pnl' => $total_pnl ?: 0
            ]
        ]);

    } catch (PDOException $e) {
        send_response(500, null, 'Database error: ' . $e->getMessage());
    }
}
?>
