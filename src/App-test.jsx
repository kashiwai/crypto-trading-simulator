import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center'
      }}>
        <h1>🚀 仮想通貨取引シミュレーター</h1>
        <p>テストアプリケーション</p>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            background: '#00ff88',
            color: '#1e1e3f',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          クリック回数: {count}
        </button>
      </div>
    </div>
  );
}

export default App;