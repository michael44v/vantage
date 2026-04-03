<?php
// api/v1/finance/withdraw.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = validate_jwt();

    $amount = (float)($data['amount'] ?? 0);
    $method = $data['method'] ?? 'manual';

    if ($amount <= 0) send_response(400, null, 'Invalid withdrawal amount');

    $pdo = get_db_connection();
    $pdo->beginTransaction();

    try {
        // Check wallet balance
        $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $wallet_balance = (float)$stmt->fetchColumn();

        if ($wallet_balance < $amount) {
            throw new Exception("Insufficient wallet balance for withdrawal");
        }

        // Deduct from wallet and create pending transaction
        $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
        $stmt->execute([$amount, $user['id']]);

        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, type, amount, method, status) VALUES (?, 'withdrawal', ?, ?, 'pending')");
        $stmt->execute([$user['id'], $amount, $method]);

        $pdo->commit();
        send_response(200, null, 'Withdrawal request submitted successfully');

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        send_response(500, null, $e->getMessage());
    }
}
?>
