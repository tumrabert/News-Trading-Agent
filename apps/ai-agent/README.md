# CryptoSentinel - AI Trading Agent

> **Advanced crypto trading agent built with Brain Framework for hackathon demonstration**

CryptoSentinel is a sophisticated AI trading agent that monitors global crypto news and on-chain data to execute intelligent trading decisions. Built with Brain Framework to showcase superior type safety, plugin architecture, and developer experience.

## 🏆 Hackathon Features

### Brain Framework Showcase
- **Type-Safe Configuration**: Full TypeScript support vs traditional character.json
- **Builder Pattern**: Intuitive agent construction with `.withPlugin()` chaining
- **Custom Plugin System**: Advanced plugin development with Brain's utilities
- **Specialized Core Plugins**: Heartbeat for scheduling, Sequencer for chaining operations
- **ATP Integration Ready**: Future tokenization capabilities

### Advanced Trading Capabilities
- **Real-time News Monitoring**: RSS feeds from CoinDesk, CoinTelegraph, Decrypt, The Block
- **Sentiment Analysis**: Advanced NLP for bullish/bearish/neutral classification
- **Risk Management**: Sophisticated position sizing, drawdown control, emergency stops
- **Multi-Exchange Support**: Ready for Binance, OKX, Hyperliquid, DEXs
- **Portfolio Optimization**: AI-driven allocation recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API Key
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd news-trading-agent

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Environment Configuration

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for future trading integration
BINANCE_API_KEY=your_binance_key
BINANCE_SECRET=your_binance_secret
OKX_API_KEY=your_okx_key
OKX_SECRET=your_okx_secret

# Optional - for notifications
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_ID=your_chat_id
DISCORD_WEBHOOK_URL=your_discord_webhook
```

### Run the Agent

```bash
# Development mode
pnpm dev

# Production mode
pnpm build && pnpm start
```

## 🧠 Brain Framework Architecture

### Core Agent Structure
```typescript
const agent = new AgentBuilder()
    .withModelProvider(ModelProviderName.OPENAI, API_KEY)
    .withDatabase(SqliteAdapter)
    .withClient(DirectClient)
    .withCharacter({
        name: "CryptoSentinel",
        bio: "Advanced AI trading agent...",
        // Type-safe character configuration
    })
    .withPlugin(heartbeatPlugin)      // Brain's scheduling
    .withPlugin(sequencerPlugin)      // Brain's chaining
    .withPlugin(newsMonitorPlugin)    // Custom news analysis
    .withPlugin(riskManagementPlugin) // Custom risk control
    .build();
```

### Custom Plugin Development
```typescript
// Using Brain Framework's createSimplePlugin utility
const newsMonitorPlugin = createSimplePlugin({
    name: "news-monitor",
    description: "Monitors crypto news sources for market-moving events",
    actions: [
        {
            name: "CHECK_NEWS",
            description: "Check all configured news sources",
            handler: async (opts) => {
                // Advanced news processing logic
                // Type-safe with full IntelliSense support
            }
        }
    ]
});
```

## 📊 Features Deep Dive

### 1. News Monitoring System
- **Multi-Source RSS Monitoring**: CoinDesk, CoinTelegraph, Decrypt, The Block
- **Crypto-Relevance Filtering**: Only processes cryptocurrency-related articles
- **Sentiment Analysis**: Advanced keyword-based sentiment classification
- **Asset Extraction**: Automatically identifies affected cryptocurrencies
- **Confidence Scoring**: Reliability assessment based on source and content quality

### 2. Risk Management Engine
- **Dynamic Position Sizing**: Confidence-based allocation with portfolio percentage limits
- **Drawdown Protection**: Automatic position reduction during portfolio decline
- **Daily Loss Limits**: Configurable daily maximum loss thresholds
- **Emergency Stops**: Circuit breakers for extreme market conditions
- **Human Approval Gates**: Configurable thresholds for manual trade approval

### 3. Trading Signal Generation
```typescript
interface TradingSignal {
    action: 'buy' | 'sell' | 'hold';
    asset: string;
    confidence: number; // 0-100
    reasoning: string;
    urgency: 'low' | 'medium' | 'high' | 'immediate';
    targetPrice?: number;
    stopLoss?: number;
    positionSize?: number;
}
```

### 4. Portfolio Optimization
- **Multi-Signal Analysis**: Evaluates multiple trading opportunities simultaneously
- **Capital Allocation**: Optimal distribution based on confidence and risk parameters
- **Correlation Awareness**: Considers asset correlation in portfolio construction
- **Risk-Adjusted Returns**: Maximizes return per unit of risk taken

## 🎯 Available Commands

### News Monitoring
- `"Check news"` - Scan all news sources for new crypto articles
- `"Get latest news"` - View recent processed news events with sentiment analysis

### Risk Management
- `"Evaluate signal"` - Analyze current trading signals against risk parameters
- `"Get risk status"` - View comprehensive risk metrics and portfolio status
- `"Optimize portfolio"` - Get AI-driven portfolio allocation recommendations

### Interactive Examples
```
User: "What's the latest crypto news?"
CryptoSentinel: "📰 NEWS MONITORING REPORT
Found 3 new crypto-related articles
🚨 CRITICAL EVENTS (1):
• SEC Approves Bitcoin ETF Applications
  Assets: BTC
  Sentiment: BULLISH
  Signal: BUY (85% confidence)"
```

## 🔧 Configuration

### Risk Levels
```typescript
// Conservative
{
    maxPositionSize: 2,        // 2% per trade
    stopLossPercentage: 5,     // 5% stop loss
    maxDailyLoss: 5,          // 5% max daily loss
    humanApprovalThreshold: 1  // Approve trades > 1%
}

// Moderate (Default)
{
    maxPositionSize: 5,        // 5% per trade
    stopLossPercentage: 8,     // 8% stop loss
    maxDailyLoss: 10,         // 10% max daily loss
    humanApprovalThreshold: 3  // Approve trades > 3%
}

// Aggressive
{
    maxPositionSize: 10,       // 10% per trade
    stopLossPercentage: 15,    // 15% stop loss
    maxDailyLoss: 20,         // 20% max daily loss
    humanApprovalThreshold: 7  // Approve trades > 7%
}
```

### News Sources
- **CoinDesk** (Priority: 9) - Industry standard financial news
- **CoinTelegraph** (Priority: 8) - Comprehensive crypto coverage
- **Decrypt** (Priority: 7) - Technology-focused reporting
- **The Block** (Priority: 8) - Institutional crypto news

## 🏗️ Project Structure

```
src/
├── index.ts                 # Main agent configuration
├── types/                   # TypeScript type definitions
│   └── index.ts
├── utils/                   # Utility functions
│   └── index.ts
├── plugins/                 # Custom Brain Framework plugins
│   ├── news-monitor/        # News monitoring plugin
│   │   └── index.ts
│   ├── risk-management/     # Risk management plugin
│   │   └── index.ts
│   ├── trading-execution/   # Trading execution plugin (future)
│   └── notification/        # Notification plugin (future)
└── data/                    # SQLite database
    └── db.sqlite
```

## 🚀 Future Roadmap

### Phase 2: On-Chain Monitoring
- Whale wallet tracking
- Exchange flow analysis
- DeFi protocol monitoring
- Smart contract event detection

### Phase 3: Trading Execution
- Binance API integration
- OKX trading support
- DEX aggregator integration
- Hyperliquid perpetuals

### Phase 4: Advanced Features
- Machine learning signal enhancement
- Cross-asset correlation analysis
- Social sentiment integration
- Real-world asset (RWA) expansion

### Phase 5: Production Features
- Multi-user support
- Advanced backtesting
- Performance analytics
- Compliance reporting

## 🛡️ Security & Risk Disclaimers

⚠️ **Important Disclaimers:**
- This is a demonstration project for hackathon purposes
- Not financial advice - for educational use only
- Always implement proper risk management in live trading
- Never risk more than you can afford to lose
- Thoroughly test any trading system before live deployment

### Security Best Practices
- Never commit API keys or private keys to version control
- Use environment variables for all sensitive configuration
- Implement proper authentication for production deployment
- Regular security audits for live trading systems
- Use dedicated development/testing accounts with limited funds

## 🤝 Contributing

This project showcases Brain Framework's capabilities for hackathon evaluation. For production use:

1. Implement comprehensive testing suite
2. Add proper error handling and recovery
3. Integrate real exchange APIs with proper authentication
4. Add comprehensive logging and monitoring
5. Implement proper database migrations and backup strategies

## 📄 License

MIT License - See LICENSE file for details

## 🏆 Hackathon Highlights

### Brain Framework Advantages Demonstrated
1. **Type Safety**: Zero runtime configuration errors
2. **Developer Experience**: IntelliSense support throughout
3. **Plugin Architecture**: Modular, testable, reusable components
4. **Performance**: Efficient plugin loading and execution
5. **Scalability**: Easy to extend with new features and integrations

### Technical Innovation
- Advanced sentiment analysis with confidence scoring
- Sophisticated risk management with dynamic position sizing
- Real-time news processing with crypto-relevance filtering
- Portfolio optimization with correlation awareness
- Extensible architecture for multi-asset class support

---

**Built with ❤️ using Brain Framework for superior AI agent development**
