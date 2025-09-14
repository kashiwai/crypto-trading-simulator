import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';
import './Portfolio.css';

function Portfolio({ positions, balance, currentPrices }) {
  const calculateProfit = (position) => {
    if (position.status === 'closed') {
      return (position.sellPrice - position.buyPrice) * position.amount;
    }
    const currentPrice = currentPrices[position.symbol] || position.buyPrice;
    return (currentPrice - position.buyPrice) * position.amount;
  };

  const calculateProfitPercentage = (position) => {
    if (position.status === 'closed') {
      return ((position.sellPrice - position.buyPrice) / position.buyPrice) * 100;
    }
    const currentPrice = currentPrices[position.symbol] || position.buyPrice;
    return ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
  };

  const openPositions = positions.filter(p => p.status === 'open');
  const closedPositions = positions.filter(p => p.status === 'closed');

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h2>
          <Briefcase size={24} />
          ポートフォリオ
        </h2>
        <div className="portfolio-balance">
          <span className="balance-label">現金残高</span>
          <span className="balance-value">¥{balance.toLocaleString()}</span>
        </div>
      </div>

      {openPositions.length > 0 && (
        <div className="positions-section">
          <h3>オープンポジション</h3>
          <div className="positions-list">
            {openPositions.map(position => {
              const profit = calculateProfit(position);
              const profitPercentage = calculateProfitPercentage(position);
              const currentPrice = currentPrices[position.symbol] || position.buyPrice;

              return (
                <div key={position.id} className="position-card">
                  <div className="position-header">
                    <span className="position-symbol">{position.symbol}</span>
                    <span className={`position-profit ${profit >= 0 ? 'profit' : 'loss'}`}>
                      {profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {profitPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="position-details">
                    <div className="detail-row">
                      <span className="detail-label">数量</span>
                      <span className="detail-value">{position.amount.toFixed(6)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">購入価格</span>
                      <span className="detail-value">¥{position.buyPrice.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">現在価格</span>
                      <span className="detail-value">¥{currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">評価額</span>
                      <span className="detail-value">¥{(position.amount * currentPrice).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">損益</span>
                      <span className={`detail-value ${profit >= 0 ? 'profit' : 'loss'}`}>
                        {profit >= 0 ? '+' : ''}¥{profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {closedPositions.length > 0 && (
        <div className="positions-section">
          <h3>クローズドポジション</h3>
          <div className="closed-positions-list">
            {closedPositions.slice(0, 5).map(position => {
              const profit = calculateProfit(position);
              const profitPercentage = calculateProfitPercentage(position);

              return (
                <div key={position.id} className="closed-position-item">
                  <span className="position-symbol">{position.symbol}</span>
                  <span className="position-amount">{position.amount.toFixed(4)}</span>
                  <span className={`position-result ${profit >= 0 ? 'profit' : 'loss'}`}>
                    {profit >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                  </span>
                  <span className={`position-profit-value ${profit >= 0 ? 'profit' : 'loss'}`}>
                    {profit >= 0 ? '+' : ''}¥{profit.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {positions.length === 0 && (
        <div className="empty-portfolio">
          <p>まだポジションがありません</p>
          <span>取引を開始して資産を増やしましょう</span>
        </div>
      )}
    </div>
  );
}

export default Portfolio;