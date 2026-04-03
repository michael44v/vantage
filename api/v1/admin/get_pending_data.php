<?php
// api/v1/admin/get_pending_data.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_admin(); // Secure extraction of admin context

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

        // System stats
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users");
        $stmt->execute();
        $total_users = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM trading_accounts");
        $stmt->execute();
        $total_accounts = $stmt->fetchColumn();

        send_response(200, [
            'kyc' => $kyc,
            'transactions' => $transactions,
            'stats' => [
                'total_users' => $total_users,
                'total_accounts' => $total_accounts,
                'total_deposits' => 45200, // Mock for simulation
                'platform_pnl' => 125000 // Mock for simulation
            ]
        ]);

    } catch (PDOException $e) {
        send_response(500, null, 'Database error: ' . $e->getMessage());
    }
}
?>
