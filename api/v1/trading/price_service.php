<?php
// api/v1/trading/price_service.php

function fetch_market_price($symbol) {
    $apiKey = getenv('FINNHUB_API_KEY') ?: 'mock_key';

    // In real app, call Finnhub API: https://finnhub.io/api/v1/quote?symbol=...&token=...
    // For this simulation, we'll use a semi-random price movement from a base
    $basePrices = [
        'EURUSD' => 1.0850,
        'GBPUSD' => 1.2640,
        'USDJPY' => 151.20,
        'XAUUSD' => 2165.50,
        'BTCUSD' => 65430.00
    ];

    $base = $basePrices[$symbol] ?? 1.00;

    // Generate a pseudo-random price fluctuation based on time
    $fluctuation = sin(time() / 10) * ($base * 0.001);
    $price = $base + $fluctuation + (rand(-10, 10) / 10000);

    return round($price, 5);
}

function calculate_pnl($type, $open_price, $current_price, $volume) {
    $lotSize = 100000; // Standard lot size for Forex
    if (strpos($current_price, 'XAU') !== false) $lotSize = 100; // Gold

    if ($type === 'buy') {
        return ($current_price - $open_price) * $volume * $lotSize;
    } else {
        return ($open_price - $current_price) * $volume * $lotSize;
    }
}
?>
