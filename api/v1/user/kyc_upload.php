<?php
// api/v1/user/kyc_upload.php

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = validate_jwt();
    $user_id = $user['id'];
    $doc_type = $_POST['document_type'] ?? null;

    if (empty($doc_type) || empty($_FILES['kyc_file'])) {
        send_response(400, null, 'Document type and file are required');
    }

    // File Validation
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf'];
    $file_extension = strtolower(pathinfo($_FILES['kyc_file']['name'], PATHINFO_EXTENSION));

    if (!in_array($file_extension, $allowed_extensions)) {
        send_response(400, null, 'Invalid file type. Only JPG, PNG, and PDF allowed.');
    }

    $upload_dir = BASE_DIR . '/../../uploads/kyc/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

    $new_filename = $user_id . '_' . time() . '.' . $file_extension;
    $target_file = $upload_dir . $new_filename;

    if (move_uploaded_at_file($_FILES['kyc_file']['tmp_name'], $target_file)) {
        $pdo = get_db_connection();
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("INSERT INTO kyc_documents (user_id, document_type, file_path) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $doc_type, $target_file]);

            $stmt = $pdo->prepare("UPDATE users SET kyc_status = 'pending' WHERE id = ?");
            $stmt->execute([$user_id]);

            $pdo->commit();
            send_response(200, ['filename' => $new_filename], 'Document uploaded successfully');
        } catch (PDOException $e) {
            $pdo->rollBack();
            send_response(500, null, 'Database error: ' . $e->getMessage());
        }
    } else {
        send_response(500, null, 'Failed to save file.');
    }
}

function move_uploaded_at_file($from, $to) {
    if (file_exists($from)) {
        return rename($from, $to);
    }
    return false;
}
?>
