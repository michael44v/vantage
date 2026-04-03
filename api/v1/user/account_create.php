<?php
// api/v1/user/account_create.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = validate_jwt(); // Secure extraction of user context

    $pdo = get_db_connection();
    $pdo->beginTransaction();

    try {
        $user_id = $user['id'];
        $initial_balance = $data['initial_balance'] ?? 0;
        $account_type = $data['account_type'] ?? 'live'; // 'demo' or 'live'

        // Get appropriate plan based on balance (Vantage-like tiers)
        $stmt = $pdo->prepare("SELECT id FROM plans WHERE ? BETWEEN min_balance AND max_balance");
        $stmt->execute([$initial_balance]);
        $plan_id = $stmt->fetchColumn();

        if (!$plan_id) throw new Exception("No plan found for this balance tier");

        $account_number = rand(100000, 999999);

        // Deduct from wallet if live
        if ($account_type === 'live' && $initial_balance > 0) {
            $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $wallet_balance = $stmt->fetchColumn();

            if ($wallet_balance < $initial_balance) {
                throw new Exception("Insufficient wallet balance");
            }

            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
            $stmt->execute([$initial_balance, $user_id]);
        }

        $stmt = $pdo->prepare("INSERT INTO trading_accounts (user_id, plan_id, account_number, account_type, balance, equity) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $plan_id, $account_number, $account_type, $initial_balance, $initial_balance]);
        $account_id = $pdo->lastInsertId();

        $pdo->commit();
        send_response(200, ['account_id' => $account_id, 'account_number' => $account_number], 'Trading account created');

    } catch (Exception $e) {
        $pdo->rollBack();
        send_response(500, null, $e->getMessage());
    }
}
?>
