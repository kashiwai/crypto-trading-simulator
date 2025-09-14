import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Activity, DollarSign, Bot, AlertCircle } from 'lucide-react';
import AdvancedPriceChart from './AdvancedPriceChart';
import Portfolio from './Portfolio';
import TradingPanel from './TradingPanel';
import GoalTracker from './GoalTracker';
import CryptoAPI from '../services/CryptoAPI';
import './Dashboard.css';

function Dashboard({ simulator, config }) {
  const [currentPrices, setCurrentPrices] = useState({});
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [selectedCryptos, setSelectedCryptos] = useState([]);

  const [portfolio, setPortfolio] = useState({
    balance: config.initialBalance,
    positions: [],
    totalValue: config.initialBalance,
    profitLoss: 0,
    profitPercentage: 0
  });

  const [trades, setTrades] = useState([]);
  const [isAutoTrading, setIsAutoTrading] = useState(config.autoTrade);
  const [startTime] = useState(new Date());
  const [aiStatus, setAiStatus] = useState('待機中');

  // 初回価格取得（50通貨）
  useEffect(() => {
    const loadInitialPrices = async () => {
      try {
        const prices = await CryptoAPI.getMultiplePrices();
        setCurrentPrices(prices);
        // ランダムに20通貨を選択
        const allSymbols = Object.keys(prices);
        const randomSymbols = allSymbols.sort(() => Math.random() - 0.5).slice(0, 20);
        setSelectedCryptos(randomSymbols);
        setPricesLoaded(true);
      } catch (error) {
        console.error('Initial price load error:', error);
        // フォールバック価格を設定
        const fallbackPrices = CryptoAPI.getFallbackPrices();
        setCurrentPrices(fallbackPrices);
        const allSymbols = Object.keys(fallbackPrices);
        const randomSymbols = allSymbols.sort(() => Math.random() - 0.5).slice(0, 20);
        setSelectedCryptos(randomSymbols);
        setPricesLoaded(true);
      }
    };
    loadInitialPrices();
  }, []);

  // WebSocketとAPIでリアルタイム価格取得
  useEffect(() => {
    if (!pricesLoaded || selectedCryptos.length === 0) return;

    // 主要通貨のWebSocket接続
    const mainCryptos = ['btc', 'eth', 'bnb', 'sol', 'ada', 'doge', 'xrp', 'dot', 'matic', 'link'];
    const ws = CryptoAPI.connectWebSocket(
      mainCryptos,
      (data) => {
        setCurrentPrices(prev => ({
          ...prev,
          [data.symbol]: data.price
        }));
        updatePortfolioValue();
      }
    );

    // APIからの定期更新（全通貨）
    const priceInterval = setInterval(async () => {
      try {
        const prices = await CryptoAPI.getMultiplePrices();
        setCurrentPrices(prices);
        updatePortfolioValue();
      } catch (error) {
        console.error('Price update error:', error);
      }
    }, 10000); // 10秒ごとに全通貨更新

    return () => {
      ws.close();
      clearInterval(priceInterval);
    };
  }, [pricesLoaded, selectedCryptos]);

  useEffect(() => {
    if (isAutoTrading) {
      const autoTradeInterval = setInterval(() => {
        performAutoTrade();
      }, 500); // 0.5秒ごとに高頻度実行

      return () => clearInterval(autoTradeInterval);
    }
  }, [isAutoTrading, currentPrices]);

  useEffect(() => {
    updatePortfolioValue();
  }, [currentPrices, portfolio.positions]);

  const performAutoTrade = () => {
    if (!pricesLoaded || Object.keys(currentPrices).length === 0) return;

    // 選択された20通貨からランダムに選択
    const tradableSymbols = selectedCryptos.filter(s => currentPrices[s] && currentPrices[s] > 0);
    if (tradableSymbols.length === 0) return;

    const randomSymbol = tradableSymbols[Math.floor(Math.random() * tradableSymbols.length)];
    const price = currentPrices[randomSymbol];

    // 高頻度少額取引戦略
    const openPositions = portfolio.positions.filter(p => p.status === 'open');

    // ポジションの利益確認（より細かい利確）
    for (const position of openPositions) {
      const currentPrice = currentPrices[position.symbol];
      const profitPercentage = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;

      // 0.5%以上の利益で一部売却（スキャルピング）
      if (profitPercentage > 0.5) {
        const sellAmount = position.amount * 0.5; // 半分売却
        executeTrade('sell', position.symbol, sellAmount, currentPrice);
        setAiStatus(`${position.symbol}を一部利確 (+${profitPercentage.toFixed(2)}%)`);
        return;
      }
      // 2%以上の損失でストップロス
      if (profitPercentage < -2) {
        executeTrade('sell', position.symbol, position.amount, currentPrice);
        setAiStatus(`${position.symbol}を損切り (${profitPercentage.toFixed(2)}%)`);
        return;
      }
    }

    // 新規購入判断（超少額・超高頻度）
    const shouldBuy = Math.random() > 0.2 && portfolio.balance > 1000 && openPositions.length < 50;

    if (shouldBuy) {
      // 超最小単位での取引（残高の0.5-2%）
      const investPercent = 0.005 + Math.random() * 0.015; // 0.5-2%
      const maxInvest = portfolio.balance * investPercent;
      const amount = maxInvest / price;

      if (amount > 0.00001) { // 超極小単位でも取引
        executeTrade('buy', randomSymbol, amount, price);
        setAiStatus(`${randomSymbol}を少額購入 (${(investPercent * 100).toFixed(2)}%)`);
      }
    }
  };

  const executeTrade = (type, symbol, amount, price) => {
    const trade = {
      id: Date.now(),
      type,
      symbol,
      amount,
      price,
      timestamp: new Date(),
      total: amount * price
    };

    if (type === 'buy') {
      const newBalance = portfolio.balance - trade.total;
      const newPosition = {
        id: Date.now(),
        symbol,
        amount,
        buyPrice: price,
        currentPrice: price,
        status: 'open'
      };

      setPortfolio(prev => ({
        ...prev,
        balance: newBalance,
        positions: [...prev.positions, newPosition]
      }));
    } else {
      const position = portfolio.positions.find(p => p.symbol === symbol && p.status === 'open');
      if (position) {
        const profit = (price - position.buyPrice) * amount;
        const newBalance = portfolio.balance + trade.total;

        setPortfolio(prev => ({
          ...prev,
          balance: newBalance,
          positions: prev.positions.map(p =>
            p.id === position.id ? { ...p, status: 'closed', sellPrice: price } : p
          ),
          profitLoss: prev.profitLoss + profit
        }));
      }
    }

    setTrades(prev => [trade, ...prev.slice(0, 19)]);
    updatePortfolioValue();
  };

  const updatePortfolioValue = () => {
    let totalValue = portfolio.balance;
    const updatedPositions = portfolio.positions.map(position => {
      if (position.status === 'open' && currentPrices[position.symbol]) {
        const currentPrice = currentPrices[position.symbol];
        totalValue += position.amount * currentPrice;
        return { ...position, currentPrice };
      }
      return position;
    });

    const profitLoss = totalValue - config.initialBalance;
    const profitPercentage = (profitLoss / config.initialBalance) * 100;

    setPortfolio(prev => ({
      ...prev,
      positions: updatedPositions,
      totalValue,
      profitLoss,
      profitPercentage
    }));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="header-content"
        >
          <h1>AI仮想通貨トレーディング</h1>
          <div className="ai-status">
            <Bot size={20} className={isAutoTrading ? 'active' : ''} />
            <span>AI: {aiStatus}</span>
            <button
              className={`ai-toggle ${isAutoTrading ? 'active' : ''}`}
              onClick={() => setIsAutoTrading(!isAutoTrading)}
            >
              {isAutoTrading ? '停止' : '開始'}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <motion.div
          className="stats-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">総資産</span>
              <span className="stat-value">¥{portfolio.totalValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon profit">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">損益</span>
              <span className={`stat-value ${portfolio.profitLoss >= 0 ? 'profit' : 'loss'}`}>
                {portfolio.profitLoss >= 0 ? '+' : ''}¥{portfolio.profitLoss.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">収益率</span>
              <span className={`stat-value ${portfolio.profitPercentage >= 0 ? 'profit' : 'loss'}`}>
                {portfolio.profitPercentage >= 0 ? '+' : ''}{portfolio.profitPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">目標まで</span>
              <span className="stat-value">
                {(config.targetProfit - portfolio.profitPercentage).toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="goal-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GoalTracker
            config={config}
            currentValue={portfolio.totalValue}
            startValue={config.initialBalance}
          />
        </motion.div>

        <motion.div
          className="chart-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AdvancedPriceChart prices={currentPrices} trades={trades} />
        </motion.div>

        <motion.div
          className="trading-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TradingPanel
            currentPrices={currentPrices}
            portfolio={portfolio}
            onTrade={executeTrade}
          />
        </motion.div>

        <motion.div
          className="portfolio-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Portfolio
            positions={portfolio.positions}
            balance={portfolio.balance}
            currentPrices={currentPrices}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;