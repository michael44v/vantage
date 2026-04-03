import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AdminDashboard = () => {
  const [pendingKyc, setPendingKyc] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_accounts: 0, total_deposits: 0, platform_pnl: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await apiClient.get('/admin/get_pending_data.php');
      if (response.data.success) {
        setPendingKyc(response.data.data.kyc);
        setPendingTransactions(response.data.data.transactions);
        setStats(response.data.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycAction = async (userId, status) => {
    try {
      const response = await apiClient.post('/admin/kyc_approve.php', { user_id: userId, status: status });
      alert(response.data.message);
      fetchAdminData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleTransactionAction = async (id, action) => {
    // Action: 'approved' or 'rejected'
    alert(`Transaction ${id} ${action} (Manual processing)`);
    // fetchAdminData();
  };

  if (loading) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <div className="admin-dashboard p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-12">Admin Control Panel</h1>

        {/* KYC Queue Section */}
        <section className="mb-12 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">Pending KYC Verifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-700/50 border-b border-gray-700">
                  <th className="p-4">User</th>
                  <th className="p-4">Document</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingKyc.map(kyc => (
                  <tr key={kyc.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold">{kyc.full_name}</div>
                      <div className="text-xs text-gray-500">{kyc.user_email}</div>
                    </td>
                    <td className="p-4 uppercase text-gray-400 font-medium">{kyc.document_type.replace('_', ' ')}</td>
                    <td className="p-4 text-gray-500">{kyc.submitted_at}</td>
                    <td className="p-4 flex space-x-3">
                      <button onClick={() => handleKycAction(kyc.user_id, 'approved')} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold text-xs transition-colors">APPROVE</button>
                      <button onClick={() => handleKycAction(kyc.user_id, 'rejected')} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold text-xs transition-colors">REJECT</button>
                      <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded font-bold text-xs transition-colors">VIEW DOC</button>
                    </td>
                  </tr>
                ))}
                {pendingKyc.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-600">No pending KYC verifications.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transactions Requests Section */}
        <section className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-red-400">Manual Financial Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-700/50 border-b border-gray-700">
                  <th className="p-4">User</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Requested At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-bold">{t.user_email}</td>
                    <td className={`p-4 font-bold ${t.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'deposit' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                    </td>
                    <td className="p-4 uppercase text-gray-400 font-medium">{t.type}</td>
                    <td className="p-4 text-gray-500">{t.created_at}</td>
                    <td className="p-4 flex space-x-3">
                      <button onClick={() => handleTransactionAction(t.id, 'approved')} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold text-xs transition-colors">CONFIRM</button>
                      <button onClick={() => handleTransactionAction(t.id, 'rejected')} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded font-bold text-xs transition-colors">DECLINE</button>
                    </td>
                  </tr>
                ))}
                {pendingTransactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-600">No pending manual transactions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
           <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all">
              <span className="text-gray-500 text-xs uppercase block mb-2 font-bold tracking-widest">Total Users</span>
              <span className="text-4xl font-black text-white">{stats.total_users.toLocaleString()}</span>
           </div>
           <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center text-center group hover:border-green-500/50 transition-all">
              <span className="text-gray-500 text-xs uppercase block mb-2 font-bold tracking-widest">Active Accounts</span>
              <span className="text-4xl font-black text-white">{stats.total_accounts.toLocaleString()}</span>
           </div>
           <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center text-center group hover:border-yellow-500/50 transition-all">
              <span className="text-gray-500 text-xs uppercase block mb-2 font-bold tracking-widest">Daily Deposits</span>
              <span className="text-4xl font-black text-green-400">${stats.total_deposits.toLocaleString()}</span>
           </div>
           <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center text-center group hover:border-blue-400 transition-all">
              <span className="text-gray-500 text-xs uppercase block mb-2 font-bold tracking-widest">Platform PnL</span>
              <span className="text-4xl font-black text-blue-400">${stats.platform_pnl.toLocaleString()}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
