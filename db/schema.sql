-- Vantage-like Trading Platform Schema

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('user', 'admin') DEFAULT 'user',
    kyc_status ENUM('not_submitted', 'pending', 'approved', 'rejected') DEFAULT 'not_submitted',
    wallet_balance DECIMAL(20, 8) DEFAULT 0.00000000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_type ENUM('id_card', 'passport', 'drivers_license', 'proof_of_address') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_balance DECIMAL(20, 2) NOT NULL,
    max_balance DECIMAL(20, 2) NOT NULL,
    leverage INT NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS trading_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type ENUM('demo', 'live') DEFAULT 'live',
    balance DECIMAL(20, 2) DEFAULT 0.00,
    equity DECIMAL(20, 2) DEFAULT 0.00,
    is_signal_provider BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    volume DECIMAL(10, 2) NOT NULL,
    open_price DECIMAL(20, 5) NOT NULL,
    close_price DECIMAL(20, 5) NULL,
    sl DECIMAL(20, 5) NULL,
    tp DECIMAL(20, 5) NULL,
    pnl DECIMAL(20, 2) DEFAULT 0.00,
    status ENUM('open', 'closed') DEFAULT 'open',
    open_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    close_time TIMESTAMP NULL,
    parent_trade_id INT NULL, -- For copy trading tracking
    FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_trade_id) REFERENCES trades(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT NULL, -- Null if wallet deposit/withdrawal
    type ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out') NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method ENUM('coinbase', 'manual', 'internal') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    proof_file VARCHAR(255) NULL,
    tx_hash VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS copy_trading (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_account_id INT NOT NULL,
    copier_account_id INT NOT NULL,
    status ENUM('active', 'paused', 'stopped') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_account_id, copier_account_id),
    FOREIGN KEY (provider_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (copier_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
);

-- Seed basic plans
INSERT INTO plans (name, min_balance, max_balance, leverage, commission) VALUES
('Standard STP', 100.00, 499.99, 500, 0.00),
('Raw ECN', 500.00, 4999.99, 500, 3.00),
('Pro ECN', 5000.00, 999999999.99, 500, 2.00);
