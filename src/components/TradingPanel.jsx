import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import './TradingPanel.css';

function TradingPanel({ currentPrices, portfolio, onTrade }) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setShowConfirm(true);
  };

  const confirmTrade = () => {
    const price = currentPrices[selectedCrypto];
    onTrade(tradeType, selectedCrypto, parseFloat(amount), price);
    setAmount('');
    setShowConfirm(false);
  };

  const cancelTrade = () => {
    setShowConfirm(false);
  };

  const totalCost = parseFloat(amount || 0) * currentPrices[selectedCrypto];
  const canAfford = tradeType === 'buy' ? totalCost <= portfolio.balance : true;

  const hasPosition = portfolio.positions.some(
    p => p.symbol === selectedCrypto && p.status === 'open'
  );

  return (
    <div className="trading-panel">
      <div className="panel-header">
        <h2>
          <ShoppingCart size={24} />
          取引パネル
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="trading-form">
        <div className="trade-type-selector">
          <button
            type="button"
            className={`type-btn ${tradeType === 'buy' ? 'active buy' : ''}`}
            onClick={() => setTradeType('buy')}
          >
            買い
          </button>
          <button
            type="button"
            className={`type-btn ${tradeType === 'sell' ? 'active sell' : ''}`}
            onClick={() => setTradeType('sell')}
          >
            売り
          </button>
        </div>

        <div className="form-group">
          <label>仮想通貨</label>
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="crypto-select"
          >
            {Object.keys(currentPrices).map(crypto => (
              <option key={crypto} value={crypto}>
                {crypto} - ¥{currentPrices[crypto].toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>数量</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            min="0"
            className="amount-input"
          />
        </div>

        <div className="trade-summary">
          <div className="summary-row">
            <span>現在価格</span>
            <span>¥{currentPrices[selectedCrypto].toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>合計金額</span>
            <span className={!canAfford ? 'insufficient' : ''}>
              ¥{totalCost.toLocaleString()}
            </span>
          </div>
          <div className="summary-row">
            <span>残高</span>
            <span>¥{portfolio.balance.toLocaleString()}</span>
          </div>
        </div>

        {tradeType === 'sell' && !hasPosition && (
          <div className="warning-message">
            <AlertCircle size={16} />
            {selectedCrypto}のポジションがありません
          </div>
        )}

        {tradeType === 'buy' && !canAfford && (
          <div className="warning-message">
            <AlertCircle size={16} />
            残高が不足しています
          </div>
        )}

        <motion.button
          type="submit"
          className={`submit-btn ${tradeType}`}
          disabled={!amount || parseFloat(amount) <= 0 || (tradeType === 'buy' && !canAfford) || (tradeType === 'sell' && !hasPosition)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tradeType === 'buy' ? '購入する' : '売却する'}
        </motion.button>
      </form>

      {showConfirm && (
        <motion.div
          className="confirm-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="confirm-content">
            <h3>取引確認</h3>
            <p>
              {tradeType === 'buy' ? '購入' : '売却'}: {amount} {selectedCrypto}
            </p>
            <p>金額: ¥{totalCost.toLocaleString()}</p>
            <div className="confirm-buttons">
              <button onClick={confirmTrade} className="confirm-yes">
                確定
              </button>
              <button onClick={cancelTrade} className="confirm-no">
                キャンセル
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TradingPanel;