import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const TradingTerminal = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [volume, setVolume] = useState(0.01);
  const [activeTrades, setActiveTrades] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [priceData, setPriceData] = useState({
    EURUSD: 1.0854, GBPUSD: 1.2642, USDJPY: 151.20, XAUUSD: 2165.50, BTCUSD: 65430.00
  });

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(updatePrices, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchOpenTrades();
    }
  }, [selectedAccount]);

  useEffect(() => {
    // Dynamically load TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": `FX:${selectedSymbol}`,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_chart"
        });
      }
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, [selectedSymbol]);

  const fetchAccounts = async () => {
    try {
      const response = await apiClient.get('/user/get_dashboard_data.php');
      if (response.data.success) {
        setAccounts(response.data.data.trading_accounts);
        if (response.data.data.trading_accounts.length > 0) {
          setSelectedAccount(response.data.data.trading_accounts[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching accounts', err);
    }
  };

  const fetchOpenTrades = async () => {
    if (!selectedAccount) return;
    try {
      const response = await apiClient.get(`/trading/get_open_trades.php?account_id=${selectedAccount.id}`);
      if (response.data.success) {
        setActiveTrades(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching trades', err);
    }
  };

  const updatePrices = () => {
    setPriceData(prev => ({
      ...prev,
      EURUSD: prev.EURUSD + (Math.random() - 0.5) * 0.0002,
      GBPUSD: prev.GBPUSD + (Math.random() - 0.5) * 0.0002,
      USDJPY: prev.USDJPY + (Math.random() - 0.5) * 0.02,
      XAUUSD: prev.XAUUSD + (Math.random() - 0.5) * 0.1,
      BTCUSD: prev.BTCUSD + (Math.random() - 0.5) * 5,
    }));
  };

  const handleOrder = async (type) => {
    if (!selectedAccount) return alert('Select a trading account first');
    try {
      const response = await apiClient.post('/trading/execute.php', {
        account_id: selectedAccount.id,
        symbol: selectedSymbol,
        type: type,
        volume: parseFloat(volume)
      });
      alert(response.data.message);
      fetchOpenTrades();
    } catch (err) {
      alert('Order failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCloseTrade = async (tradeId) => {
    try {
      const response = await apiClient.post('/trading/close.php', { trade_id: tradeId });
      alert(response.data.message);
      fetchOpenTrades();
      fetchAccounts(); // Update balance
    } catch (err) {
      alert('Close failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const calculatePnL = (trade) => {
    const currentPrice = priceData[trade.symbol];
    const lotSize = trade.symbol === 'XAUUSD' ? 100 : (trade.symbol === 'BTCUSD' ? 1 : 100000);
    const diff = trade.type === 'buy' ? currentPrice - parseFloat(trade.open_price) : parseFloat(trade.open_price) - currentPrice;
    return (diff * parseFloat(trade.volume) * lotSize).toFixed(2);
  };

  return (
    <div className="terminal-container p-4 bg-gray-900 text-white min-h-screen flex">
      {/* Left sidebar - Market Watch */}
      <div className="w-1/4 border-r border-gray-700 pr-4 flex flex-col">
        <div className="mb-8">
           <label className="block text-gray-500 text-xs uppercase mb-2">Select Account</label>
           <select
              value={selectedAccount?.id || ''}
              onChange={(e) => setSelectedAccount(accounts.find(a => a.id == e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 p-2 text-sm rounded font-bold"
           >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>#{a.account_number} ({a.account_type.toUpperCase()} - ${parseFloat(a.balance).toFixed(2)})</option>
              ))}
           </select>
        </div>

        <h3 className="text-xl font-bold mb-4">Market Watch</h3>
        <div className="flex-1 overflow-y-auto space-y-1">
          {Object.keys(priceData).map(symbol => (
            <div
              key={symbol}
              className={`flex justify-between p-3 cursor-pointer rounded transition-all ${selectedSymbol === symbol ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-gray-800'}`}
              onClick={() => setSelectedSymbol(symbol)}
            >
              <span className="font-bold">{symbol}</span>
              <span className="text-green-400 font-mono">{priceData[symbol].toFixed(symbol === 'USDJPY' || symbol === 'XAUUSD' ? 2 : 5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 px-4 flex flex-col">
        <header className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-bold">{selectedSymbol} Trading Terminal</h2>
           <div className="text-sm font-mono flex space-x-4">
              <span className="text-gray-400">SPREAD: <span className="text-white">0.5 pips</span></span>
              <span className="text-gray-400">TIME: <span className="text-white font-bold">{new Date().toLocaleTimeString()}</span></span>
           </div>
        </header>

        <div id="tradingview_chart" className="flex-1 rounded-lg overflow-hidden relative shadow-inner border border-gray-700 min-h-[400px]">
           {/* TradingView Widget injected here */}
        </div>

        {/* Active Trades Table */}
        <div className="mt-6 h-64 overflow-y-auto bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
            Open Positions
            <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400 font-normal">{activeTrades.length} Active</span>
          </h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="p-2 pb-4 font-normal">Symbol</th>
                <th className="p-2 pb-4 font-normal">Type</th>
                <th className="p-2 pb-4 font-normal text-right">Volume</th>
                <th className="p-2 pb-4 font-normal text-right">Open Price</th>
                <th className="p-2 pb-4 font-normal text-right">Current Price</th>
                <th className="p-2 pb-4 font-normal text-right">Profit / Loss</th>
                <th className="p-2 pb-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTrades.map(trade => {
                const pnl = calculatePnL(trade);
                return (
                  <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 font-mono transition-all">
                    <td className="p-2 font-bold">{trade.symbol}</td>
                    <td className={`p-2 font-bold uppercase ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</td>
                    <td className="p-2 text-right">{parseFloat(trade.volume).toFixed(2)}</td>
                    <td className="p-2 text-right text-gray-400">{parseFloat(trade.open_price).toFixed(2)}</td>
                    <td className="p-2 text-right">{priceData[trade.symbol]?.toFixed(2)}</td>
                    <td className={`p-2 text-right font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl}
                    </td>
                    <td className="p-2 text-right">
                       <button
                          onClick={() => handleCloseTrade(trade.id)}
                          className="bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1 rounded border border-red-500/50 transition-all text-xs font-black uppercase"
                       >
                          CLOSE
                       </button>
                    </td>
                  </tr>
                );
              })}
              {activeTrades.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-600">No open positions in this account.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Sidebar - Execution Panel */}
      <div className="w-1/4 border-l border-gray-700 pl-4 space-y-6">
        <h3 className="text-xl font-bold border-b border-gray-700 pb-4">Execution Panel</h3>

        <div>
          <label className="block text-gray-500 text-xs uppercase mb-2 font-bold">Transaction Volume (Lots)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 p-4 text-2xl font-bold rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
             <span>Min: 0.01</span>
             <span>Max: 100.00</span>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => handleOrder('buy')}
            className="bg-green-600 hover:bg-green-700 text-white w-full py-6 rounded-lg font-black text-2xl shadow-lg transition-all transform active:scale-95"
          >
            BUY / LONG
          </button>
          <button
            onClick={() => handleOrder('sell')}
            className="bg-red-600 hover:bg-red-700 text-white w-full py-6 rounded-lg font-black text-2xl shadow-lg transition-all transform active:scale-95"
          >
            SELL / SHORT
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
           <div className="flex justify-between text-sm">
              <span className="text-gray-400">Equity Requirement</span>
              <span className="font-bold font-mono">${(volume * 500).toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-sm">
              <span className="text-gray-400">Estimated Margin</span>
              <span className="font-bold font-mono">0.20%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TradingTerminal;
