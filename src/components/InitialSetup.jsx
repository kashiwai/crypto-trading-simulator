import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Bot, Zap } from 'lucide-react';
import './InitialSetup.css';

function InitialSetup({ onComplete }) {
  const [formData, setFormData] = useState({
    initialBalance: 1000000,
    targetProfit: 20,
    targetPeriod: 30,
    strategy: 'combined',
    autoTrade: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const expectedReturn = formData.initialBalance * (1 + formData.targetProfit / 100);
  const dailyTarget = (formData.targetProfit / formData.targetPeriod).toFixed(2);

  return (
    <div className="initial-setup">
      <motion.div
        className="setup-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="setup-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <TrendingUp size={48} className="header-icon" />
          </motion.div>
          <h1>仮想通貨AIトレーディング</h1>
          <p>目標を設定してAI自動売買を開始</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <motion.div
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label>
              <Zap size={20} />
              初期投資金額
            </label>
            <div className="input-wrapper">
              <span className="currency">¥</span>
              <input
                type="number"
                name="initialBalance"
                value={formData.initialBalance}
                onChange={handleChange}
                min="10000"
                step="10000"
                required
              />
            </div>
            <span className="input-hint">最小: ¥10,000</span>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label>
              <Target size={20} />
              目標収益率
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                name="targetProfit"
                value={formData.targetProfit}
                onChange={handleChange}
                min="1"
                max="100"
                step="1"
                required
              />
              <span className="unit">%</span>
            </div>
            <span className="input-hint">推奨: 10-30%</span>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label>
              <Calendar size={20} />
              達成期間
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                name="targetPeriod"
                value={formData.targetPeriod}
                onChange={handleChange}
                min="1"
                max="365"
                step="1"
                required
              />
              <span className="unit">日</span>
            </div>
            <span className="input-hint">1日あたり {dailyTarget}%の成長が必要</span>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label>
              <Bot size={20} />
              取引戦略
            </label>
            <select
              name="strategy"
              value={formData.strategy}
              onChange={handleChange}
              className="strategy-select"
            >
              <option value="conservative">保守的 (低リスク)</option>
              <option value="balanced">バランス型</option>
              <option value="combined">AI複合戦略 (推奨)</option>
              <option value="aggressive">積極的 (高リスク)</option>
            </select>
          </motion.div>

          <motion.div
            className="form-group checkbox-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="autoTrade"
                checked={formData.autoTrade}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              <span>AI自動売買を有効にする</span>
            </label>
          </motion.div>

          <motion.div
            className="target-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="preview-card">
              <h3>目標達成時の資産</h3>
              <div className="preview-amount">
                ¥{expectedReturn.toLocaleString()}
              </div>
              <div className="preview-details">
                <div className="detail-item">
                  <span>利益</span>
                  <span className="profit">+¥{(expectedReturn - formData.initialBalance).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span>期間</span>
                  <span>{formData.targetPeriod}日</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="start-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {formData.autoTrade ? 'AI自動売買を開始' : 'シミュレーションを開始'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default InitialSetup;