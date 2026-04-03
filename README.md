# Vantage-like Trading Broker Simulation (React + PHP + SQL)

A professional full-stack trading simulation platform featuring a React frontend, a RESTful Plain PHP API, and a MySQL database. This project mirrors the features of major brokers like Vantage Markets.

## 🚀 Key Features
- **Client Portal**: Multi-tier account management (Standard STP, Raw ECN, Pro ECN).
- **Trading Terminal**: Real-time (pseudo-simulated) prices with integrated **TradingView Charts**.
- **Copy Trading**: Mirror trades from signal providers proportionally based on equity.
- **KYC System**: User document upload (ID/Passport) with an administrative review workflow.
- **Financial Wallet**: Supports both automated **Coinbase Commerce** and **Manual Bank Transfer** deposits.
- **Admin Panel**: Full control over user verification, withdrawals, and platform statistics.

---

## 🛠️ Quick Start

### 1. Database Setup (MySQL)
1.  Create a new database named `vantage_db`.
2.  Import the schema from `db/schema.sql`:
    ```bash
    mysql -u your_user -p vantage_db < db/schema.sql
    ```

### 2. Backend API Setup (PHP)
1.  Point your web server (Apache/Nginx) to the `api/v1/` directory.
2.  Ensure PHP 7.4+ is installed.
3.  Set the following environment variables in your server:
    - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`

### 3. Frontend Setup (React)
From the project root directory, run:
```bash
npm install
npm start
```
*Note: This will automatically install dependencies in the `client/` folder and start the development server.*

---

## 🛡️ Security Implementation
- **JWT Authentication**: HMAC-SHA256 signed tokens for secure user sessions.
- **IDOR Protection**: Secure extraction of `user_id` from tokens, preventing unauthorized account access.
- **Admin Authorization**: Role-based access control for administrative endpoints.
- **PDO Security**: 100% prepared statements to prevent SQL Injection.

## 📈 Trading Simulation
- **Prices**: Time-based pseudo-random price movements in `price_service.php`.
- **Copy Trading Logic**: Proportional mirroring based on copier-to-provider equity ratio.
- **Financial Flow**: Full lifecycle from manual/automated deposit to trade closure and withdrawal reconciliation.

---

## 📂 Project Structure
- `api/v1/`: PHP REST API (Auth, Trading, Finance, Admin).
- `client/`: React Frontend (Dashboard, Terminal, CopyTrading, KYC).
- `db/`: MySQL Schema and initial seeds.
- `package.json`: Root manager for frontend commands.
