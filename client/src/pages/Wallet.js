import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('manual');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/finance/deposit.php', {
        user_id: user.id,
        amount: parseFloat(amount),
        method: method,
        proof_file: method === 'manual' ? 'mock_proof.jpg' : null
      });
      alert(response.data.message);
    } catch (err) {
      alert('Deposit failed: ' + err.message);
    }
  };

  return (
    <div className="wallet-container p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-10">Financial Wallet</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {/* Deposit Form */}
           <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
             <h2 className="text-2xl font-bold mb-6">Deposit Funds</h2>
             <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 p-4 rounded-lg text-2xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Select Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMethod('coinbase')}
                      className={`p-4 border-2 rounded-xl text-center font-bold transition-all ${method === 'coinbase' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}`}
                    >
                      <span className="block text-xl mb-1">Coinbase</span>
                      <span className="text-xs text-gray-400 uppercase">Crypto (Instant)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('manual')}
                      className={`p-4 border-2 rounded-xl text-center font-bold transition-all ${method === 'manual' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}`}
                    >
                      <span className="block text-xl mb-1">Manual Pay</span>
                      <span className="text-xs text-gray-400 uppercase">Bank/Wallet (Review)</span>
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-bold text-lg">
                  Next Step
                </button>
             </form>
           </div>

           {/* Manual Payment Info */}
           {method === 'manual' && (
             <div className="bg-blue-900/10 border border-blue-500/30 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Manual Payment Instructions</h3>
                <p className="text-gray-300 mb-6">Please transfer the exact amount to the following account and upload a receipt screenshot.</p>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-500 text-sm block uppercase">Account Holder</span>
                    <span className="text-lg font-bold text-white">VANTAGE GLOBAL LTD</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block uppercase">Account Number (IBAN)</span>
                    <span className="text-lg font-bold text-white">GB12 VANT 4040 0012 3456 78</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block uppercase">SWIFT / BIC</span>
                    <span className="text-lg font-bold text-white">VANTGB2L</span>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-blue-500/20">
                   <p className="text-xs text-gray-400 italic font-medium">* Manual deposits are reviewed by our financial team within 1-2 hours during business days.</p>
                </div>
             </div>
           )}

           {/* Coinbase Payment Info */}
           {method === 'coinbase' && (
             <div className="bg-blue-900/10 border border-blue-500/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white p-4 rounded-xl mb-6">
                  {/* Mock QR Code */}
                   <div className="w-full h-full bg-gray-900 rounded"></div>
                </div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">Pay with Coinbase</h3>
                <p className="text-gray-300 max-w-xs">You will be redirected to the secure Coinbase Commerce portal to complete your crypto payment.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
