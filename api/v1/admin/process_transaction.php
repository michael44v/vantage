<?php
// api/v1/admin/process_transaction.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_admin();
    $data = json_decode(file_get_contents('php://input'), true);

    $id = (int)($data['id'] ?? 0);
    $status = $data['status'] ?? 'completed'; // 'completed' or 'rejected'

    if (!$id) send_response(400, null, 'Transaction ID is required');

    $pdo = get_db_connection();
    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ? AND status = 'pending'");
        $stmt->execute([$id]);
        $transaction = $stmt->fetch();

        if (!$transaction) throw new Exception("Transaction not found or already processed");

        // Update transaction status
        $stmt = $pdo->prepare("UPDATE transactions SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        // If rejection, refund the user wallet if it was a withdrawal
        if ($status === 'rejected' && $transaction['type'] === 'withdrawal') {
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
            $stmt->execute([$transaction['amount'], $transaction['user_id']]);
        }

        // If approval and it's a manual deposit, add to user wallet
        if ($status === 'completed' && $transaction['type'] === 'deposit' && $transaction['method'] === 'manual') {
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
            $stmt->execute([$transaction['amount'], $transaction['user_id']]);
        }

        $pdo->commit();
        send_response(200, null, 'Transaction processed successfully');

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        send_response(500, null, $e->getMessage());
    }
}
?>
