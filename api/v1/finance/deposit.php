<?php
// api/v1/finance/deposit.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = validate_jwt(); // Use the enhanced security check

    $pdo = get_db_connection();
    $pdo->beginTransaction();

    try {
        $user_id = $user['id']; // Extract ID from secure token, not request body
        $amount = (float)($data['amount'] ?? 0);
        $method = $data['method'] ?? 'manual';

        if ($amount <= 0) throw new Exception("Invalid deposit amount");

        if ($method === 'manual') {
            $proof_file = $data['proof_file'] ?? 'pending_upload.jpg';
            $stmt = $pdo->prepare("INSERT INTO transactions (user_id, type, amount, method, status, proof_file) VALUES (?, 'deposit', ?, 'manual', 'pending', ?)");
            $stmt->execute([$user_id, $amount, $proof_file]);
            $transaction_id = $pdo->lastInsertId();
            $pdo->commit();
            send_response(200, ['transaction_id' => $transaction_id], 'Manual deposit request submitted');
        } else if ($method === 'coinbase') {
            // Simplified Coinbase Simulation
            $stmt = $pdo->prepare("INSERT INTO transactions (user_id, type, amount, method, status) VALUES (?, 'deposit', ?, 'coinbase', 'completed')");
            $stmt->execute([$user_id, $amount]);
            $transaction_id = $pdo->lastInsertId();

            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
            $stmt->execute([$amount, $user_id]);

            $pdo->commit();
            send_response(200, ['transaction_id' => $transaction_id], 'Coinbase deposit completed');
        } else {
            throw new Exception("Invalid payment method");
        }

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        send_response(500, null, $e->getMessage());
    }
}
?>
