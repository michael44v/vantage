<?php
// api/v1/trading/close.php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/price_service.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = validate_jwt();

    $trade_id = (int)($data['trade_id'] ?? 0);
    if (!$trade_id) send_response(400, null, 'Trade ID is required');

    $pdo = get_db_connection();
    $pdo->beginTransaction();

    try {
        // Fetch trade and account details
        $stmt = $pdo->prepare("
            SELECT t.*, ta.user_id, ta.balance
            FROM trades t
            JOIN trading_accounts ta ON t.account_id = ta.id
            WHERE t.id = ? AND t.status = 'open'
        ");
        $stmt->execute([$trade_id]);
        $trade = $stmt->fetch();

        if (!$trade || $trade['user_id'] != $user['id']) {
            throw new Exception("Trade not found or access denied");
        }

        $close_price = fetch_market_price($trade['symbol']);
        $pnl = calculate_pnl($trade['symbol'], $trade['type'], (float)$trade['open_price'], (float)$close_price, (float)$trade['volume']);

        // Update Trade status
        $stmt = $pdo->prepare("UPDATE trades SET close_price = ?, close_time = CURRENT_TIMESTAMP, pnl = ?, status = 'closed' WHERE id = ?");
        $stmt->execute([$close_price, $pnl, $trade_id]);

        // Update Account balance
        $stmt = $pdo->prepare("UPDATE trading_accounts SET balance = balance + ?, equity = equity + ? WHERE id = ?");
        $stmt->execute([$pnl, $pnl, $trade['account_id']]);

        // --- Copy Trading: Close mirrored trades ---
        $stmt = $pdo->prepare("SELECT id, account_id FROM trades WHERE parent_trade_id = ? AND status = 'open'");
        $stmt->execute([$trade_id]);
        $mirrored_trades = $stmt->fetchAll();

        foreach ($mirrored_trades as $m_trade) {
            $m_pnl = calculate_pnl($trade['symbol'], $trade['type'], (float)$trade['open_price'], (float)$close_price, (float)$trade['volume']); // Simplified for simulation

            $stmt = $pdo->prepare("UPDATE trades SET close_price = ?, close_time = CURRENT_TIMESTAMP, pnl = ?, status = 'closed' WHERE id = ?");
            $stmt->execute([$close_price, $m_pnl, $m_trade['id']]);

            $stmt = $pdo->prepare("UPDATE trading_accounts SET balance = balance + ?, equity = equity + ? WHERE id = ?");
            $stmt->execute([$m_pnl, $m_pnl, $m_trade['account_id']]);
        }

        $pdo->commit();
        send_response(200, ['pnl' => $pnl, 'close_price' => $close_price], 'Trade closed successfully');

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        send_response(500, null, $e->getMessage());
    }
}
?>
