# MCP (Model Context Protocol) 設定ドキュメント

## プロジェクト概要
仮想通貨取引シミュレーター - 50種類の仮想通貨をAIで自動売買

## MCP設定完了項目

### ✅ 保存完了
- **プロジェクトディレクトリ**: `/Users/kotarokashiwai/stock/web`
- **GitHub リポジトリ**: https://github.com/kashiwai/crypto-trading-simulator
- **MCP設定ファイル**: `mcp-config.json`

### 📁 ファイル構成
```
/Users/kotarokashiwai/stock/web/
├── src/                    # Reactアプリケーションソース
│   ├── components/         # UIコンポーネント
│   ├── services/          # APIサービス
│   └── App.jsx           # メインアプリケーション
├── standalone.html        # スタンドアロン版（CDN）
├── mcp-config.json       # MCP設定ファイル
├── 仕様書.md             # 詳細仕様書
├── package.json          # Node.js依存関係
└── vite.config.js        # Vite設定
```

## 起動方法

### 1. 開発サーバー版
```bash
cd /Users/kotarokashiwai/stock/web
npm install
npm run dev
```
アクセス: http://localhost:5173

### 2. スタンドアロン版
```bash
open /Users/kotarokashiwai/stock/web/standalone.html
```
ブラウザで直接開く（サーバー不要）

## MCP環境での実行

### 環境変数設定
```bash
export MCP_PROJECT_PATH="/Users/kotarokashiwai/stock/web"
export MCP_CONFIG_FILE="mcp-config.json"
```

### MCPコマンド
```bash
# プロジェクト情報表示
cat $MCP_PROJECT_PATH/$MCP_CONFIG_FILE

# アプリケーション起動
cd $MCP_PROJECT_PATH && npm run dev

# スタンドアロン版起動
open $MCP_PROJECT_PATH/standalone.html
```

## 主要機能

### 取引機能
- 50種類の仮想通貨対応
- 0.5秒ごとの高頻度取引
- AI自動売買
- リアルタイム価格（Binance API）

### 技術スタック
- React 18
- Vite
- Chart.js
- Framer Motion
- Binance Public API

## API設定

### Binance API
- エンドポイント: `https://api.binance.com/api/v3`
- WebSocket: `wss://stream.binance.com:9443`
- APIキー不要（Public API使用）

## 取引戦略

### 購入条件
- 最大5ポジション
- 残高50,000円以上
- 50%の確率で実行
- 投資額: 残高の2%

### 売却条件
- 0.1%以上の利益で即売却
- 1.0%以上の損失で損切り
- 50%の確率でランダム売却

## トラブルシューティング

### アプリが表示されない場合
1. 開発サーバーを再起動
```bash
cd /Users/kotarokashiwai/stock/web
npm run dev
```

2. ブラウザキャッシュをクリア（Cmd+Shift+R）

3. スタンドアロン版を使用
```bash
open /Users/kotarokashiwai/stock/web/standalone.html
```

## サポート対象仮想通貨（50種類）
BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX, DOT, MATIC,
LINK, UNI, LTC, FTM, ATOM, XLM, NEAR, ALGO, VET, FIL,
ICP, APT, ARB, OP, INJ, TRX, HBAR, LDO, IMX, GRT,
SAND, MANA, AXS, THETA, EGLD, FLOW, CHZ, KCS, QNT, AAVE,
SNX, CRV, MKR, COMP, ENJ, BAT, ZIL, DASH, NEO, WAVES

## 更新履歴
- 2025-09-14: 初期バージョン作成
- MCP設定ファイル追加
- GitHub リポジトリ公開

---
Created with Claude Code
Repository: https://github.com/kashiwai/crypto-trading-simulator