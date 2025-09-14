import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import InitialSetup from './components/InitialSetup';
import TradingSimulator from './services/TradingSimulator';

function App() {
  const [isSetup, setIsSetup] = useState(false);
  const [simulator, setSimulator] = useState(null);
  const [config, setConfig] = useState({
    initialBalance: 1000000,
    targetProfit: 20,
    targetPeriod: 30,
    strategy: 'combined',
    autoTrade: false
  });

  const handleSetupComplete = (setupConfig) => {
    setConfig(setupConfig);
    const newSimulator = new TradingSimulator(setupConfig.initialBalance);
    setSimulator(newSimulator);
    setIsSetup(true);
  };

  return (
    <div className="app">
      {!isSetup ? (
        <InitialSetup onComplete={handleSetupComplete} />
      ) : (
        <Dashboard simulator={simulator} config={config} />
      )}
    </div>
  );
}

export default App;