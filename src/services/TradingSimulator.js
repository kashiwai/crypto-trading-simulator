class TradingSimulator {
  constructor(initialBalance = 1000000) {
    this.initialBalance = initialBalance;
    this.balance = initialBalance;
    this.positions = [];
    this.trades = [];
    this.currentPrices = {};
    this.startTime = new Date();
  }

  updatePrice(symbol, price) {
    this.currentPrices[symbol] = {
      price: price,
      timestamp: new Date()
    };
  }

  buy(symbol, amount, price = null) {
    const buyPrice = price || this.currentPrices[symbol]?.price;
    if (!buyPrice) {
      throw new Error(`価格情報がありません: ${symbol}`);
    }

    const cost = amount * buyPrice;
    const fee = cost * 0.001; // 0.1%の手数料
    const totalCost = cost + fee;

    if (totalCost > this.balance) {
      throw new Error(`残高不足: 必要額 ${totalCost}, 残高 ${this.balance}`);
    }

    this.balance -= totalCost;

    const position = {
      id: this.generateTradeId(),
      symbol,
      amount,
      buyPrice,
      cost: totalCost,
      fee,
      timestamp: new Date(),
      status: 'open'
    };

    this.positions.push(position);
    this.trades.push({
      ...position,
      type: 'buy'
    });

    return position;
  }

  sell(symbol, amount, price = null) {
    const sellPrice = price || this.currentPrices[symbol]?.price;
    if (!sellPrice) {
      throw new Error(`価格情報がありません: ${symbol}`);
    }

    const openPositions = this.positions.filter(p =>
      p.symbol === symbol && p.status === 'open'
    );

    if (openPositions.length === 0) {
      throw new Error(`売却可能なポジションがありません: ${symbol}`);
    }

    let remainingAmount = amount;
    const soldPositions = [];

    for (const position of openPositions) {
      if (remainingAmount <= 0) break;

      const sellAmount = Math.min(position.amount, remainingAmount);
      const revenue = sellAmount * sellPrice;
      const fee = revenue * 0.001; // 0.1%の手数料
      const netRevenue = revenue - fee;

      this.balance += netRevenue;

      const profit = netRevenue - (position.cost * (sellAmount / position.amount));
      const profitPercentage = (profit / (position.cost * (sellAmount / position.amount))) * 100;

      if (sellAmount === position.amount) {
        position.status = 'closed';
        position.sellPrice = sellPrice;
        position.profit = profit;
        position.profitPercentage = profitPercentage;
        position.closeTimestamp = new Date();
      } else {
        position.amount -= sellAmount;
        const partialPosition = {
          ...position,
          amount: sellAmount,
          status: 'closed',
          sellPrice,
          profit,
          profitPercentage,
          closeTimestamp: new Date()
        };
        soldPositions.push(partialPosition);
      }

      remainingAmount -= sellAmount;

      this.trades.push({
        id: this.generateTradeId(),
        symbol,
        amount: sellAmount,
        type: 'sell',
        price: sellPrice,
        revenue: netRevenue,
        fee,
        profit,
        profitPercentage,
        timestamp: new Date()
      });
    }

    return soldPositions;
  }

  getPortfolioValue() {
    let totalValue = this.balance;

    for (const position of this.positions.filter(p => p.status === 'open')) {
      const currentPrice = this.currentPrices[position.symbol]?.price;
      if (currentPrice) {
        totalValue += position.amount * currentPrice;
      }
    }

    return totalValue;
  }

  getPerformanceMetrics() {
    const totalValue = this.getPortfolioValue();
    const totalProfit = totalValue - this.initialBalance;
    const profitPercentage = (totalProfit / this.initialBalance) * 100;

    const closedTrades = this.trades.filter(t => t.type === 'sell');
    const winningTrades = closedTrades.filter(t => t.profit > 0);
    const losingTrades = closedTrades.filter(t => t.profit < 0);

    const winRate = closedTrades.length > 0
      ? (winningTrades.length / closedTrades.length) * 100
      : 0;

    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length
      : 0;

    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length)
      : 0;

    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    return {
      totalValue,
      balance: this.balance,
      totalProfit,
      profitPercentage,
      totalTrades: this.trades.length,
      openPositions: this.positions.filter(p => p.status === 'open').length,
      closedTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      simulationDuration: Math.floor((new Date() - this.startTime) / 60000)
    };
  }

  generateTradeId() {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  reset() {
    this.balance = this.initialBalance;
    this.positions = [];
    this.trades = [];
    this.currentPrices = {};
    this.startTime = new Date();
  }
}

export default TradingSimulator;