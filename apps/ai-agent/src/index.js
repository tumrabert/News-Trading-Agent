"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_sqlite_1 = __importDefault(require("@elizaos/adapter-sqlite"));
const client_direct_1 = __importDefault(require("@elizaos/client-direct"));
const agent_1 = require("@iqai/agent");
const plugin_heartbeat_1 = require("@iqai/plugin-heartbeat");
const plugin_sequencer_1 = require("@iqai/plugin-sequencer");
const dotenv_1 = __importDefault(require("dotenv"));
// Import our custom plugins
const index_js_1 = require("./plugins/news-monitor/index.js");
const index_js_2 = require("./plugins/risk-management/index.js");
const index_js_3 = require("./utils/index.js");
// Load environment variables
dotenv_1.default.config();
const logger = new index_js_3.Logger('CryptoSentinel');
const API_KEY = process.env.OPENAI_API_KEY || (() => {
    throw new Error("OPENAI_API_KEY is not defined in the environment variables");
})();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger.info("🚀 Initializing CryptoSentinel Trading Agent...");
            // Initialize custom plugins with Brain Framework
            const newsMonitorPlugin = (0, index_js_1.createNewsMonitorPlugin)({
                sources: index_js_1.defaultNewsSources,
                checkInterval: 300, // 5 minutes
                maxArticlesPerCheck: 20
            });
            const riskManagementPlugin = (0, index_js_2.createRiskManagementPlugin)({
                defaultRisk: index_js_2.defaultRiskConfig,
                portfolioValue: 10000, // $10,000 demo portfolio
                maxDrawdown: 20, // 20% max drawdown
                emergencyStopLoss: 25 // 25% emergency stop
            });
            // Initialize Brain Framework's specialized plugins
            const heartbeatPlugin = yield (0, plugin_heartbeat_1.createHeartbeatPlugin)([
                {
                    period: "*/30 * * * * *", // Every 30 seconds
                    input: "Check for new crypto news and evaluate trading signals",
                    clients: [
                        {
                            type: "callback",
                            callback: (content, roomId) => __awaiter(this, void 0, void 0, function* () {
                                logger.info(`Heartbeat: ${content}`);
                            })
                        }
                    ]
                }
            ]);
            const sequencerPlugin = yield (0, plugin_sequencer_1.createSequencerPlugin)();
            // Create CryptoSentinel agent with Brain Framework's builder pattern
            const agent = new agent_1.AgentBuilder()
                .withModelProvider(agent_1.ModelProviderName.OPENAI, API_KEY)
                .withDatabase(adapter_sqlite_1.default)
                .withClient(client_direct_1.default)
                .withCharacter({
                name: "CryptoSentinel",
                bio: "Advanced AI trading agent specializing in real-time crypto news analysis and automated trading decisions. Built with Brain Framework for superior type safety and plugin architecture.",
                username: "cryptosentinel",
                messageExamples: [
                    [
                        {
                            user: "User",
                            content: {
                                text: "What's the latest crypto news?",
                            },
                        },
                        {
                            user: "CryptoSentinel",
                            content: {
                                text: "I'm monitoring multiple crypto news sources in real-time. Let me check for the latest market-moving events and provide you with a comprehensive analysis including sentiment and trading signals.",
                            },
                        },
                    ],
                    [
                        {
                            user: "User",
                            content: {
                                text: "Show me the current risk status",
                            },
                        },
                        {
                            user: "CryptoSentinel",
                            content: {
                                text: "I'll provide you with a detailed risk management report including portfolio metrics, active trades, and current risk parameters. My advanced risk management system ensures optimal position sizing and drawdown control.",
                            },
                        },
                    ]
                ],
                lore: [
                    "CryptoSentinel is an advanced AI trading agent built with Brain Framework",
                    "Specializes in real-time news analysis and automated trading decisions",
                    "Features sophisticated risk management and portfolio optimization",
                    "Monitors multiple exchanges: Binance, OKX, Hyperliquid, and DEXs",
                    "Uses advanced sentiment analysis and confidence scoring",
                    "Designed for hackathon demonstration of Brain Framework capabilities"
                ],
                style: {
                    all: [
                        "Professional and analytical",
                        "Data-driven decision making",
                        "Risk-aware and safety-focused",
                        "Clear and actionable insights"
                    ],
                    chat: [
                        "Concise and informative",
                        "Uses emojis for visual clarity",
                        "Provides specific metrics and percentages",
                        "Always explains reasoning behind decisions"
                    ],
                    post: [
                        "Market-focused content",
                        "Technical analysis insights",
                        "Risk management education",
                        "Trading signal explanations"
                    ]
                }
            })
                .withPlugin(heartbeatPlugin)
                .withPlugin(sequencerPlugin)
                .withPlugin(newsMonitorPlugin)
                .withPlugin(riskManagementPlugin)
                .build();
            // Start the agent
            yield agent.start();
            logger.info("✅ CryptoSentinel is now active and monitoring crypto markets!");
            logger.info("🔍 Monitoring news sources:");
            index_js_1.defaultNewsSources.forEach(source => {
                if (source.enabled) {
                    logger.info(`  • ${source.name} (Priority: ${source.priority})`);
                }
            });
            logger.info("⚖️ Risk Management Configuration:");
            logger.info(`  • Risk Level: ${index_js_2.defaultRiskConfig.level.toUpperCase()}`);
            logger.info(`  • Max Position Size: ${index_js_2.defaultRiskConfig.maxPositionSize}%`);
            logger.info(`  • Stop Loss: ${index_js_2.defaultRiskConfig.stopLossPercentage}%`);
            logger.info(`  • Max Daily Loss: ${index_js_2.defaultRiskConfig.maxDailyLoss}%`);
            logger.info("🎯 Available Commands:");
            logger.info("  • 'Check news' - Monitor latest crypto news");
            logger.info("  • 'Get latest news' - View recent news events");
            logger.info("  • 'Evaluate signal' - Analyze trading signals");
            logger.info("  • 'Get risk status' - View risk management metrics");
            logger.info("  • 'Optimize portfolio' - Get portfolio optimization recommendations");
            console.log("\n🚀 CryptoSentinel Trading Agent is running!");
            console.log("💡 You can interact with it using the IQAI Console or direct commands.");
            console.log("📊 The agent will automatically monitor news and provide trading insights.");
        }
        catch (error) {
            logger.error("Failed to start CryptoSentinel:", error);
            process.exit(1);
        }
    });
}
main().catch(console.error);
