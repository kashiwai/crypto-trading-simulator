import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { TrendingUp, TrendingDown, BarChart, LineChart, Clock } from 'lucide-react';
import './AdvancedPriceChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

function AdvancedPriceChart({ prices, trades }) {
  const [chartData, setChartData] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('1H');
  const [volumeData, setVolumeData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const now = new Date();

        newData.push({
          time: now.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          timestamp: now.getTime(),
          BTC: prices.BTC,
          ETH: prices.ETH,
          BNB: prices.BNB,
          volume: Math.random() * 1000000
        });

        // データポイント数を時間軸に応じて調整
        const maxPoints = {
          '5M': 30,
          '15M': 45,
          '1H': 60,
          '4H': 96,
          '1D': 288
        }[timeRange] || 60;

        if (newData.length > maxPoints) {
          newData.shift();
        }

        return newData;
      });

      // ボリュームデータの更新（取引量に基づいて）
      setVolumeData(prev => {
        const newVolume = [...prev];
        const baseVolume = 500000 + Math.random() * 2000000;
        const tradeVolume = trades.filter(t =>
          new Date(t.timestamp) > new Date(Date.now() - 2000)
        ).reduce((sum, t) => sum + t.total, 0);
        newVolume.push(baseVolume + tradeVolume);
        if (newVolume.length > 20) {
          newVolume.shift();
        }
        return newVolume;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [prices, timeRange, trades]);

  const getPriceChange = (crypto) => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1]?.[crypto] || 0;
    const previous = chartData[0]?.[crypto] || current;
    return ((current - previous) / previous * 100).toFixed(2);
  };

  const getHighLow = (crypto) => {
    if (chartData.length === 0) return { high: 0, low: 0 };
    const values = chartData.map(d => d[crypto] || 0);
    return {
      high: Math.max(...values),
      low: Math.min(...values)
    };
  };

  const formatPrice = (value) => {
    return `¥${value.toLocaleString()}`;
  };

  const { high, low } = getHighLow(selectedCrypto);
  const currentPrice = prices[selectedCrypto];
  const priceChange = getPriceChange(selectedCrypto);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 63, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(0, 255, 136, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `価格: ${formatPrice(context.parsed.y)}`;
          }
        }
      },
      annotation: {
        annotations: {
          currentPrice: {
            type: 'line',
            yMin: currentPrice,
            yMax: currentPrice,
            borderColor: '#00ff88',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `現在: ${formatPrice(currentPrice)}`,
              position: 'end',
              backgroundColor: '#00ff88',
              color: '#1e1e3f',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          highPrice: {
            type: 'line',
            yMin: high,
            yMax: high,
            borderColor: 'rgba(0, 255, 136, 0.3)',
            borderWidth: 1,
            borderDash: [2, 2],
            label: {
              display: true,
              content: `高値: ${formatPrice(high)}`,
              position: 'start',
              backgroundColor: 'rgba(0, 255, 136, 0.2)',
              color: '#00ff88',
              font: {
                size: 10
              }
            }
          },
          lowPrice: {
            type: 'line',
            yMin: low,
            yMax: low,
            borderColor: 'rgba(255, 68, 68, 0.3)',
            borderWidth: 1,
            borderDash: [2, 2],
            label: {
              display: true,
              content: `安値: ${formatPrice(low)}`,
              position: 'start',
              backgroundColor: 'rgba(255, 68, 68, 0.2)',
              color: '#ff4444',
              font: {
                size: 10
              }
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 8,
          font: {
            size: 11
          }
        }
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return formatPrice(value);
          },
          font: {
            size: 11
          }
        }
      }
    }
  };

  const lineChartData = {
    labels: chartData.map(d => d.time),
    datasets: [{
      label: selectedCrypto,
      data: chartData.map(d => d[selectedCrypto] || 0),
      borderColor: priceChange >= 0 ? '#00ff88' : '#ff4444',
      backgroundColor: priceChange >= 0
        ? 'rgba(0, 255, 136, 0.1)'
        : 'rgba(255, 68, 68, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: priceChange >= 0 ? '#00ff88' : '#ff4444',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2
    }]
  };

  const volumeChartData = {
    labels: chartData.map(d => d.time),
    datasets: [{
      label: 'Volume',
      data: volumeData,
      backgroundColor: 'rgba(0, 212, 255, 0.3)',
      borderColor: '#00d4ff',
      borderWidth: 1
    }]
  };

  return (
    <div className="advanced-price-chart">
      <div className="chart-header">
        <div className="chart-title">
          <h2>価格チャート</h2>
          <div className="time-range-selector">
            {['5M', '15M', '1H', '4H', '1D'].map(range => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-controls">
          <div className="chart-type-selector">
            <button
              className={`type-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
              title="ラインチャート"
            >
              <LineChart size={18} />
            </button>
            <button
              className={`type-btn ${chartType === 'candle' ? 'active' : ''}`}
              onClick={() => setChartType('candle')}
              title="ローソク足"
            >
              <BarChart size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="crypto-selector">
        {Object.keys(prices).map(crypto => (
          <button
            key={crypto}
            className={`crypto-card ${selectedCrypto === crypto ? 'active' : ''}`}
            onClick={() => setSelectedCrypto(crypto)}
          >
            <div className="crypto-info">
              <span className="crypto-name">{crypto}</span>
              <span className="crypto-price">¥{prices[crypto].toLocaleString()}</span>
            </div>
            <div className={`crypto-change ${getPriceChange(crypto) >= 0 ? 'up' : 'down'}`}>
              {getPriceChange(crypto) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(getPriceChange(crypto))}%</span>
            </div>
          </button>
        ))}
      </div>

      <div className="price-stats">
        <div className="stat-item">
          <span className="stat-label">24H高値</span>
          <span className="stat-value high">¥{high.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24H安値</span>
          <span className="stat-value low">¥{low.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24H変動</span>
          <span className={`stat-value ${priceChange >= 0 ? 'up' : 'down'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24H出来高</span>
          <span className="stat-value">¥{(volumeData.reduce((a, b) => a + b, 0)).toLocaleString()}</span>
        </div>
      </div>

      <div className="main-chart">
        <Line ref={chartRef} options={chartOptions} data={lineChartData} height={400} />
      </div>

      <div className="volume-chart">
        <h3>出来高</h3>
        <Bar
          data={volumeChartData}
          height={100}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(30, 30, 63, 0.95)',
                callbacks: {
                  label: function(context) {
                    return `出来高: ¥${context.parsed.y.toLocaleString()}`;
                  }
                }
              }
            },
            scales: {
              x: {
                display: false
              },
              y: {
                position: 'right',
                grid: {
                  color: 'rgba(255, 255, 255, 0.05)',
                  drawBorder: false
                },
                ticks: {
                  color: '#9ca3af',
                  font: { size: 10 },
                  callback: function(value) {
                    return `¥${(value / 1000).toFixed(0)}K`;
                  }
                }
              }
            }
          }}
        />
      </div>

      {trades.length > 0 && (
        <div className="trade-markers">
          {trades.slice(-10).map(trade => (
            <div
              key={trade.id}
              className={`trade-marker ${trade.type}`}
              title={`${trade.type === 'buy' ? '購入' : '売却'}: ${trade.amount} ${trade.symbol} @ ¥${trade.price.toLocaleString()}`}
            >
              <span className="marker-dot"></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdvancedPriceChart;