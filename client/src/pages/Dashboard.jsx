import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [walletBalance, setWalletBalance] = useState(0);
  const [tradingAccounts, setTradingAccounts] = useState([]);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/user/get_dashboard_data.php');
      if (response.data.success) {
        const { wallet_balance, kyc_status, trading_accounts } = response.data.data;
        setWalletBalance(wallet_balance);
        setKycStatus(kyc_status);
        setTradingAccounts(trading_accounts);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (type) => {
    const amount = type === 'demo' ? 10000 : 0;
    try {
      const response = await apiClient.post('/user/account_create.php', {
        initial_balance: amount,
        account_type: type
      });
      alert(response.data.message);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.email}!</h1>
            <p className="text-gray-400 mt-2">Manage your accounts and investments with Vantage Simulation.</p>
          </div>
          <div className="flex items-center space-x-6">
             <div className="text-right">
                <span className="text-gray-400 text-sm block">Wallet Balance</span>
                <span className="text-2xl font-bold text-green-400">${walletBalance.toFixed(2)}</span>
             </div>
             <a href="/wallet" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-colors">Deposit</a>
          </div>
        </header>

        {/* User Alert for KYC */}
        {kycStatus === 'not_submitted' && (
          <div className="bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-10 flex justify-between items-center rounded-r-lg shadow-lg">
             <p className="text-yellow-200">Your account is not verified yet. Complete KYC to access live trading and withdrawals.</p>
             <a href="/kyc" className="bg-yellow-500 text-gray-900 px-4 py-1 rounded font-bold hover:bg-yellow-400 transition-colors">Complete KYC</a>
          </div>
        )}

        {/* Trading Accounts Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trading Accounts</h2>
            <div className="space-x-4">
              <button onClick={() => handleCreateAccount('live')} className="text-blue-500 hover:text-blue-400 underline font-bold transition-colors">+ New Live Account</button>
              <button onClick={() => handleCreateAccount('demo')} className="text-green-500 hover:text-green-400 underline font-bold transition-colors">+ New Demo Account</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {tradingAccounts.length > 0 ? tradingAccounts.map(account => (
               <div key={account.id} className={`bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-${account.account_type === 'live' ? 'blue' : 'green'}-500 transition-all duration-300`}>
                  <div className="flex justify-between mb-4">
                    <span className={`text-xs ${account.account_type === 'live' ? 'bg-blue-600' : 'bg-green-600'} text-white px-2 py-1 rounded font-bold uppercase`}>
                      {account.account_type} - {account.plan_name}
                    </span>
                    <span className="text-gray-400 text-sm font-mono">#{account.account_number}</span>
                  </div>
                  <div className="mb-6">
                    <span className="text-gray-400 text-sm block mb-1">Account Balance</span>
                    <span className="text-2xl font-bold">${parseFloat(account.balance).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-6 border-t border-gray-700 pt-4">
                     <div>Leverage: <span className="text-gray-300">1:{account.leverage}</span></div>
                     <div>Comm: <span className="text-gray-300">${account.commission}</span></div>
                  </div>
                  <a href="/terminal" className="w-full block text-center bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-colors">Open Terminal</a>
               </div>
             )) : (
               <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                  No trading accounts found. Create your first account to start trading.
               </div>
             )}
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <span className="text-gray-500 text-xs uppercase block mb-1">Total Equity</span>
              <span className="text-xl font-bold">
                ${tradingAccounts.reduce((acc, curr) => acc + parseFloat(curr.equity), 0).toLocaleString()}
              </span>
           </div>
           <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <span className="text-gray-500 text-xs uppercase block mb-1">Active Accounts</span>
              <span className="text-xl font-bold">{tradingAccounts.length}</span>
           </div>
           <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <span className="text-gray-500 text-xs uppercase block mb-1">KYC Status</span>
              <span className={`text-xl font-bold uppercase ${kycStatus === 'approved' ? 'text-green-400' : 'text-yellow-400'}`}>{kycStatus.replace('_', ' ')}</span>
           </div>
           <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <span className="text-gray-500 text-xs uppercase block mb-1">Pending Withdrawals</span>
              <span className="text-xl font-bold text-red-400">$0.00</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
