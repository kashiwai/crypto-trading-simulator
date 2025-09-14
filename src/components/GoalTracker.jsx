import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, Zap } from 'lucide-react';
import './GoalTracker.css';

function GoalTracker({ config, currentValue, startValue }) {
  const targetValue = startValue * (1 + config.targetProfit / 100);
  const currentProgress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
  const daysElapsed = Math.max(1, Math.floor((new Date() - new Date(startValue)) / (1000 * 60 * 60 * 24)) || 1);
  const daysRemaining = config.targetPeriod - daysElapsed;
  const dailyTargetGrowth = config.targetProfit / config.targetPeriod;
  const actualDailyGrowth = ((currentValue - startValue) / startValue / daysElapsed) * 100;

  const getProgressColor = () => {
    if (currentProgress >= 100) return '#00ff88';
    if (currentProgress >= 75) return '#00d4ff';
    if (currentProgress >= 50) return '#ffd700';
    if (currentProgress >= 25) return '#ff9500';
    return '#ff4444';
  };

  const isOnTrack = actualDailyGrowth >= dailyTargetGrowth;

  return (
    <div className="goal-tracker">
      <div className="tracker-header">
        <h2>
          <Target size={24} />
          目標達成トラッカー
        </h2>
        <div className="track-status">
          <span className={`status-badge ${isOnTrack ? 'on-track' : 'off-track'}`}>
            {isOnTrack ? '順調' : '要改善'}
          </span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <div className="progress-labels">
            <span>現在: ¥{currentValue.toLocaleString()}</span>
            <span>目標: ¥{targetValue.toLocaleString()}</span>
          </div>
          <div className="progress-percentage">
            <span style={{ color: getProgressColor() }}>{currentProgress.toFixed(1)}%</span>
            <span className="progress-label">達成</span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(currentProgress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ background: `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}88 100%)` }}
            />
          </div>
          <div className="progress-markers">
            <div className="marker" style={{ left: '25%' }}>25%</div>
            <div className="marker" style={{ left: '50%' }}>50%</div>
            <div className="marker" style={{ left: '75%' }}>75%</div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">必要日次成長率</span>
            <span className="metric-value">{dailyTargetGrowth.toFixed(3)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Zap size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">実際の日次成長率</span>
            <span className={`metric-value ${actualDailyGrowth >= dailyTargetGrowth ? 'positive' : 'negative'}`}>
              {actualDailyGrowth.toFixed(3)}%
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">残り期間</span>
            <span className="metric-value">{daysRemaining}日</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Target size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">目標まで</span>
            <span className="metric-value">
              ¥{Math.max(0, targetValue - currentValue).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {currentProgress >= 100 && (
        <motion.div
          className="goal-achieved"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          🎉 目標達成おめでとうございます！
        </motion.div>
      )}

      {!isOnTrack && currentProgress < 100 && (
        <div className="improvement-tips">
          <h3>📈 パフォーマンス改善のヒント</h3>
          <ul>
            <li>AI自動売買を有効にして24時間取引を実行</li>
            <li>より積極的な戦略への切り替えを検討</li>
            <li>ポートフォリオの分散を最適化</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default GoalTracker;