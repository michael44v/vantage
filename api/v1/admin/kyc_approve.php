<?php
// api/v1/admin/kyc_approve.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_admin(); // Secure administrative access check
    $data = json_decode(file_get_contents('php://input'), true);

    $pdo = get_db_connection();
    $pdo->beginTransaction();

    try {
        $user_id = (int)($data['user_id'] ?? 0);
        $status = $data['status'] ?? 'pending'; // 'approved' or 'rejected'

        if (!$user_id) throw new Exception("User ID is required");

        // Update KYC document record
        $stmt = $pdo->prepare("UPDATE kyc_documents SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = ?");
        $stmt->execute([$status, $user_id]);

        // Update user KYC status
        $stmt = $pdo->prepare("UPDATE users SET kyc_status = ? WHERE id = ?");
        $stmt->execute([$status, $user_id]);

        $pdo->commit();
        send_response(200, ['user_id' => $user_id, 'status' => $status], 'KYC status updated successfully');

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        send_response(500, null, $e->getMessage());
    }
}
?>
