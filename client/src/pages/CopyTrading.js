import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const CopyTrading = () => {
  const [providers, setProviders] = useState([
    { id: 1, name: 'Advanced Trader X', roi: '145.2%', win_rate: '78%', drawdown: '12%', copiers: 450, account_id: 101 },
    { id: 2, name: 'Forex Kingpin', roi: '89.4%', win_rate: '65%', drawdown: '8%', copiers: 120, account_id: 102 },
    { id: 3, name: 'Scalping Pro', roi: '210.5%', win_rate: '82%', drawdown: '25%', copiers: 890, account_id: 103 },
  ]);
  const [accounts, setAccounts] = useState([]);
  const [selectedCopierAccountId, setSelectedCopierAccountId] = useState('');

  useEffect(() => {
    fetchUserAccounts();
  }, []);

  const fetchUserAccounts = async () => {
    try {
      const response = await apiClient.get('/user/get_dashboard_data.php');
      if (response.data.success) {
        setAccounts(response.data.data.trading_accounts);
        if (response.data.data.trading_accounts.length > 0) {
          setSelectedCopierAccountId(response.data.data.trading_accounts[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching accounts', err);
    }
  };

  const handleCopy = async (providerAccountId) => {
    if (!selectedCopierAccountId) return alert('Please select one of your accounts to copy with');
    try {
      const response = await apiClient.post('/user/copy_start.php', {
        provider_account_id: providerAccountId,
        copier_account_id: selectedCopierAccountId,
      });
      alert(response.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="copy-trading-container p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Copy Trading Hub</h1>
        <p className="text-gray-400 mb-8">Discover and follow top-performing traders. Your trades will mirror theirs proportionally.</p>

        <div className="mb-12 p-6 bg-gray-800 rounded-xl border border-gray-700 max-w-md">
           <label className="block text-gray-500 text-xs uppercase mb-2 font-bold">Your Copying Account</label>
           <select
              value={selectedCopierAccountId}
              onChange={(e) => setSelectedCopierAccountId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 p-3 rounded font-bold"
           >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>#{a.account_number} ({a.account_type.toUpperCase()} - ${parseFloat(a.balance).toFixed(2)})</option>
              ))}
           </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map(provider => (
            <div key={provider.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold shadow-inner">
                  {provider.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{provider.name}</h3>
                  <span className="text-gray-400 text-sm">Copiers: {provider.copiers}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <span className="text-gray-400 text-xs block uppercase">ROI</span>
                  <span className="text-green-400 font-bold text-lg">{provider.roi}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block uppercase">Win Rate</span>
                  <span className="text-white font-bold text-lg">{provider.win_rate}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block uppercase">Drawdown</span>
                  <span className="text-red-400 font-bold text-lg">{provider.drawdown}</span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(provider.account_id)}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-lg transition-all active:scale-95 shadow-lg"
              >
                Copy This Trader
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CopyTrading;
