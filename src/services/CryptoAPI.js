import axios from 'axios';

class CryptoAPI {
  constructor() {
    // Binance Public APIエンドポイント（APIキー不要）
    this.binanceBaseUrl = 'https://api.binance.com/api/v3';
    this.cache = new Map();
    this.cacheTimeout = 2000; // 2秒キャッシュ

    // 取引量の多い主要50通貨
    this.topCryptos = [
      'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC',
      'LINK', 'UNI', 'LTC', 'FTM', 'ATOM', 'XLM', 'NEAR', 'ALGO', 'VET', 'FIL',
      'ICP', 'APT', 'ARB', 'OP', 'INJ', 'TRX', 'HBAR', 'LDO', 'IMX', 'GRT',
      'SAND', 'MANA', 'AXS', 'THETA', 'EGLD', 'FLOW', 'CHZ', 'KCS', 'QNT', 'AAVE',
      'SNX', 'CRV', 'MKR', 'COMP', 'ENJ', 'BAT', 'ZIL', 'DASH', 'NEO', 'WAVES'
    ];
  }

  // 複数通貨の価格を一括取得
  async getMultiplePrices() {
    try {
      // Binanceで取引可能な通貨ペアのみをフィルタリング
      const symbols = this.topCryptos.map(coin => `${coin}USDT`);
      const response = await axios.get(`${this.binanceBaseUrl}/ticker/price`);

      const prices = {};
      const usdToJpy = 150;

      response.data.forEach(ticker => {
        const symbol = ticker.symbol.replace('USDT', '');
        if (this.topCryptos.includes(symbol)) {
          const usdPrice = parseFloat(ticker.price);
          prices[symbol] = usdPrice * usdToJpy;
        }
      });

      // すべての通貨が取得できなかった場合、デフォルト値を設定
      this.topCryptos.forEach(symbol => {
        if (!prices[symbol]) {
          prices[symbol] = this.getDefaultPrice(symbol);
        }
      });

      return prices;
    } catch (error) {
      console.error('Price fetch error:', error);
      return this.getFallbackPrices();
    }
  }

  // デフォルト価格設定
  getDefaultPrice(symbol) {
    const defaultPrices = {
      'BTC': 6500000, 'ETH': 400000, 'BNB': 50000, 'SOL': 20000, 'XRP': 100,
      'ADA': 80, 'DOGE': 15, 'AVAX': 5000, 'DOT': 1000, 'MATIC': 150,
      'LINK': 2000, 'UNI': 1000, 'LTC': 10000, 'FTM': 100, 'ATOM': 1500,
      'XLM': 20, 'NEAR': 500, 'ALGO': 30, 'VET': 5, 'FIL': 800,
      'ICP': 1000, 'APT': 1500, 'ARB': 200, 'OP': 300, 'INJ': 2000,
      'TRX': 15, 'HBAR': 10, 'LDO': 400, 'IMX': 200, 'GRT': 25,
      'SAND': 100, 'MANA': 100, 'AXS': 1500, 'THETA': 200, 'EGLD': 8000,
      'FLOW': 150, 'CHZ': 20, 'KCS': 1500, 'QNT': 20000, 'AAVE': 15000,
      'SNX': 500, 'CRV': 100, 'MKR': 200000, 'COMP': 8000, 'ENJ': 50,
      'BAT': 40, 'ZIL': 5, 'DASH': 5000, 'NEO': 1500, 'WAVES': 300
    };
    return defaultPrices[symbol] || 1000;
  }

  // Binanceから実際の価格を取得（主要3通貨）
  async getBinancePrices() {
    try {
      const mainSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
      const requests = mainSymbols.map(symbol =>
        axios.get(`${this.binanceBaseUrl}/ticker/price`, { params: { symbol } })
      );

      const responses = await Promise.all(requests);
      const prices = {};
      const usdToJpy = 150;

      responses.forEach(response => {
        const ticker = response.data;
        const symbol = ticker.symbol.replace('USDT', '');
        const usdPrice = parseFloat(ticker.price);
        prices[symbol] = usdPrice * usdToJpy;
      });

      return prices;
    } catch (error) {
      console.error('Binance API Error:', error);
      return this.getFallbackPrices();
    }
  }

  // 24時間の統計情報を取得
  async get24hrStats(symbol = 'BTCUSDT') {
    try {
      const response = await axios.get(`${this.binanceBaseUrl}/ticker/24hr`, {
        params: { symbol }
      });

      const data = response.data;
      const usdToJpy = 150;

      return {
        symbol: data.symbol,
        priceChange: parseFloat(data.priceChange) * usdToJpy,
        priceChangePercent: parseFloat(data.priceChangePercent),
        weightedAvgPrice: parseFloat(data.weightedAvgPrice) * usdToJpy,
        prevClosePrice: parseFloat(data.prevClosePrice) * usdToJpy,
        lastPrice: parseFloat(data.lastPrice) * usdToJpy,
        bidPrice: parseFloat(data.bidPrice) * usdToJpy,
        askPrice: parseFloat(data.askPrice) * usdToJpy,
        openPrice: parseFloat(data.openPrice) * usdToJpy,
        highPrice: parseFloat(data.highPrice) * usdToJpy,
        lowPrice: parseFloat(data.lowPrice) * usdToJpy,
        volume: parseFloat(data.volume),
        quoteVolume: parseFloat(data.quoteVolume) * usdToJpy
      };
    } catch (error) {
      console.error('24hr Stats Error:', error);
      return null;
    }
  }

  // WebSocketでリアルタイム価格を取得（複数通貨対応）
  connectWebSocket(symbols, callback) {
    // 最大10通貨まで同時接続
    const limitedSymbols = symbols.slice(0, 10).map(s => s.toLowerCase() + 'usdt');
    const streams = limitedSymbols.map(s => `${s}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s.replace('USDT', '');
      const jpyPrice = parseFloat(data.c) * 150; // 現在価格をJPYに変換

      callback({
        symbol,
        price: jpyPrice,
        priceChange: parseFloat(data.p) * 150,
        priceChangePercent: parseFloat(data.P),
        volume: parseFloat(data.v),
        quoteVolume: parseFloat(data.q) * 150
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return ws;
  }

  // フォールバック価格（API失敗時）全50通貨
  getFallbackPrices() {
    const prices = {};
    this.topCryptos.forEach(symbol => {
      prices[symbol] = this.getDefaultPrice(symbol);
    });
    return prices;
  }

  // キャッシュ管理
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }
    return null;
  }

  setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
}

export default new CryptoAPI();