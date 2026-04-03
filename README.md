# Vantage-like Trading Broker Simulation (React + PHP + SQL)

A full-stack trading simulation platform built with a React frontend, a RESTful Plain PHP API, and a MySQL database. This project mirrors the features of major brokers like Vantage Markets, including KYC verification, Copy Trading, and multi-tier account plans.

## 🚀 Key Features
- **Client Portal**: Multi-tier account management (Standard STP, Raw ECN, Pro ECN).
- **Trading Terminal**: Real-time (pseudo-simulated) prices with integrated **TradingView Charts**.
- **Copy Trading**: Mirror trades from signal providers proportionally based on equity.
- **KYC System**: User document upload (ID/Passport) with an administrative review workflow.
- **Financial Wallet**: Supports both automated **Coinbase Commerce** and **Manual Bank Transfer** deposits.
- **Admin Panel**: Full control over user verification, withdrawals, and platform statistics.

---

## 🛠️ Installation & Setup

### 1. Database Setup (MySQL)
1.  Create a new database named `vantage_db`.
2.  Import the schema from `db/schema.sql`:
    ```bash
    mysql -u your_user -p vantage_db < db/schema.sql
    ```
    *This will create all tables and seed the initial balance-based account plans.*

### 2. Backend API Setup (PHP)
1.  Ensure you have **PHP 7.4+** installed.
2.  Configure your web server (Apache/Nginx) to point to the `api/v1/` directory.
3.  **Environment Variables**: Set the following variables in your server configuration (e.g., `.htaccess` or system env):
    - `DB_HOST`: Your database host (e.g., `localhost`)
    - `DB_USER`: Your database username
    - `DB_PASS`: Your database password
    - `DB_NAME`: `vantage_db`
    - `JWT_SECRET`: A secure random string for signing tokens.

#### RESTful Routing (.htaccess example)
If using Apache, ensure your `api/v1/.htaccess` handles routing to `index.php`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### 3. Frontend Setup (React)
1.  Navigate to the `client/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set the API URL in a `.env` file:
    ```env
    REACT_APP_API_URL=http://localhost/api/v1
    ```
4.  Start the development server:
    ```bash
    npm start
    ```

---

## 🛡️ Security Implementation
- **JWT Authentication**: All user-facing API calls require a signed HMAC-SHA256 JWT in the `Authorization` header.
- **IDOR Protection**: All sensitive actions (trading, deposits, KYC) extract the `user_id` from the secure token, never the request body.
- **Admin Authorization**: Administrative endpoints use a `require_admin()` middleware to verify user roles.
- **SQL Security**: 100% usage of PDO prepared statements for all database queries.

## 📈 Trading Simulation Logic
- **Prices**: Prices are generated using a time-based pseudo-random generator in `price_service.php`.
- **Copy Trading**: The system mirrors trades from providers to copiers using the formula:
  `Copier_Volume = Provider_Volume * (Copier_Equity / Provider_Equity)`
- **PnL**: Calculated in real-time within the frontend for display and reconciled in the backend upon trade closure.

---

## 📂 Project Structure
```text
├── api/v1/               # PHP REST API
│   ├── auth/             # Login, Register, Logout
│   ├── user/             # Account Management, KYC
│   ├── trading/          # Orders, Price Service, Copy Trading
│   ├── finance/          # Wallet & Deposits
│   └── admin/            # Manual Reviews & Stats
├── client/src/           # React Frontend
│   ├── components/       # Shared UI
│   ├── pages/            # View Pages (Terminal, Dashboard, etc.)
│   └── api/              # Axios API Client
└── db/                   # Database SQL Schema
```

---

### Disclaimer
This project is a **simulation platform** intended for educational or developmental purposes. Real financial integrations (FIX API / Liquidity Bridges) are not included in this core build.
