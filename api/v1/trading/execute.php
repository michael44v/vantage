<?php
// api/v1/trading/execute.php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/price_service.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = validate_jwt(); // Secure extraction of user context

    $pdo = get_db_connection();
    $pdo->beginTransaction();

    try {
        $account_id = (int)($data['account_id'] ?? 0);
        $symbol = $data['symbol'] ?? 'EURUSD';
        $type = $data['type'] ?? 'buy'; // 'buy' or 'sell'
        $volume = (float)($data['volume'] ?? 0.01); // Lots

        if ($volume <= 0) throw new Exception("Invalid volume");

        // Verify account belongs to user (Security)
        $stmt = $pdo->prepare("SELECT balance, plan_id FROM trading_accounts WHERE id = ? AND user_id = ?");
        $stmt->execute([$account_id, $user['id']]);
        $account = $stmt->fetch();

        if (!$account) throw new Exception("Trading account not found or access denied");

        $open_price = fetch_market_price($symbol);

        // Open Trade
        $stmt = $pdo->prepare("INSERT INTO trades (account_id, symbol, type, volume, open_price, status) VALUES (?, ?, ?, ?, ?, 'open')");
        $stmt->execute([$account_id, $symbol, $type, $volume, $open_price]);
        $trade_id = $pdo->lastInsertId();

        // --- Copy Trading Logic ---
        $stmt = $pdo->prepare("SELECT copier_account_id FROM copy_trading WHERE provider_account_id = ? AND status = 'active'");
        $stmt->execute([$account_id]);
        $copiers = $stmt->fetchAll();

        foreach ($copiers as $copier) {
            $stmt = $pdo->prepare("SELECT balance FROM trading_accounts WHERE id = ?");
            $stmt->execute([$copier['copier_account_id']]);
            $copier_balance = $stmt->fetchColumn();

            // Prevention: Division by zero and invalid ratio
            if ((float)$account['balance'] > 0) {
                $ratio = (float)$copier_balance / (float)$account['balance'];
                $copier_volume = $volume * $ratio;

                if ($copier_volume >= 0.01) { // Min lot size
                    $stmt = $pdo->prepare("INSERT INTO trades (account_id, symbol, type, volume, open_price, status, parent_trade_id) VALUES (?, ?, ?, ?, ?, 'open', ?)");
                    $stmt->execute([$copier['copier_account_id'], $symbol, $type, round($copier_volume, 2), $open_price, $trade_id]);
                }
            }
        }

        $pdo->commit();
        send_response(200, ['trade_id' => $trade_id, 'open_price' => (float)$open_price], 'Order executed successfully');

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        send_response(500, null, $e->getMessage());
    }
}
?>
