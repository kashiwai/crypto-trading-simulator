import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './PriceChart.css';

function PriceChart({ prices, trades }) {
  const [chartData, setChartData] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  useEffect(() => {
    setChartData(prev => {
      const newData = [...prev];
      const timestamp = new Date().toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      newData.push({
        time: timestamp,
        BTC: prices.BTC,
        ETH: prices.ETH,
        BNB: prices.BNB
      });

      if (newData.length > 20) {
        newData.shift();
      }

      return newData;
    });
  }, [prices]);

  const getPriceChange = (crypto) => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1]?.[crypto] || 0;
    const previous = chartData[chartData.length - 2]?.[crypto] || 0;
    return ((current - previous) / previous * 100).toFixed(2);
  };

  const formatPrice = (value) => {
    return `¥${value.toLocaleString()}`;
  };

  return (
    <div className="price-chart">
      <div className="chart-header">
        <h2>価格チャート</h2>
        <div className="crypto-selector">
          {Object.keys(prices).map(crypto => (
            <button
              key={crypto}
              className={`crypto-btn ${selectedCrypto === crypto ? 'active' : ''}`}
              onClick={() => setSelectedCrypto(crypto)}
            >
              <span className="crypto-name">{crypto}</span>
              <span className="crypto-price">¥{prices[crypto].toLocaleString()}</span>
              <span className={`price-change ${getPriceChange(crypto) >= 0 ? 'up' : 'down'}`}>
                {getPriceChange(crypto) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(getPriceChange(crypto))}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={formatPrice}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e1e3f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
              formatter={(value) => formatPrice(value)}
            />
            <Line 
              type="monotone" 
              dataKey={selectedCrypto} 
              stroke="#00ff88" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#00ff88' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {trades.length > 0 && (
        <div className="recent-trades">
          <h3>最近の取引</h3>
          <div className="trades-list">
            {trades.slice(0, 5).map(trade => (
              <div key={trade.id} className={`trade-item ${trade.type}`}>
                <span className="trade-type">{trade.type === 'buy' ? '買' : '売'}</span>
                <span className="trade-symbol">{trade.symbol}</span>
                <span className="trade-amount">{trade.amount.toFixed(4)}</span>
                <span className="trade-price">¥{trade.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceChart;