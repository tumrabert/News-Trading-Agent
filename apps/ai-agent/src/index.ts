import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClient from "@elizaos/client-direct";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createHeartbeatPlugin } from "@iqai/plugin-heartbeat";
import { createSequencerPlugin } from "@iqai/plugin-sequencer";
import dotenv from "dotenv";

// Import our custom plugins
import { createNewsMonitorPlugin, defaultNewsSources } from "./plugins/news-monitor/index.js";
import { createRiskManagementPlugin, defaultRiskConfig } from "./plugins/risk-management/index.js";
import { Logger } from "./utils/index.js";

// Load environment variables
dotenv.config();

const logger = new Logger('CryptoSentinel');
const API_KEY: string = process.env.OPENAI_API_KEY || (() => { 
    throw new Error("OPENAI_API_KEY is not defined in the environment variables"); 
})();

async function main() {
    try {
        logger.info("🚀 Initializing CryptoSentinel Trading Agent...");

        // Initialize custom plugins with Brain Framework
        const newsMonitorPlugin = createNewsMonitorPlugin({
            sources: defaultNewsSources,
            checkInterval: 300, // 5 minutes
            maxArticlesPerCheck: 20
        });

        const riskManagementPlugin = createRiskManagementPlugin({
            defaultRisk: defaultRiskConfig,
            portfolioValue: 10000, // $10,000 demo portfolio
            maxDrawdown: 20, // 20% max drawdown
            emergencyStopLoss: 25 // 25% emergency stop
        });

        // Initialize Brain Framework's specialized plugins
        const heartbeatPlugin = await createHeartbeatPlugin([
            {
                period: "*/30 * * * * *", // Every 30 seconds
                input: "Check for new crypto news and evaluate trading signals",
                clients: [
                    {
                        type: "callback",
                        callback: async (content: string, roomId: string) => {
                            logger.info(`Heartbeat: ${content}`);
                        }
                    }
                ]
            }
        ]);

        const sequencerPlugin = await createSequencerPlugin();

        // Create CryptoSentinel agent with Brain Framework's builder pattern
        const agent = new AgentBuilder()
            .withModelProvider(ModelProviderName.OPENAI, API_KEY)
            .withDatabase(SqliteAdapter)
            .withClient(DirectClient)
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
        await agent.start();

        logger.info("✅ CryptoSentinel is now active and monitoring crypto markets!");
        logger.info("🔍 Monitoring news sources:");
        defaultNewsSources.forEach(source => {
            if (source.enabled) {
                logger.info(`  • ${source.name} (Priority: ${source.priority})`);
            }
        });
        
        logger.info("⚖️ Risk Management Configuration:");
        logger.info(`  • Risk Level: ${defaultRiskConfig.level.toUpperCase()}`);
        logger.info(`  • Max Position Size: ${defaultRiskConfig.maxPositionSize}%`);
        logger.info(`  • Stop Loss: ${defaultRiskConfig.stopLossPercentage}%`);
        logger.info(`  • Max Daily Loss: ${defaultRiskConfig.maxDailyLoss}%`);
        
        logger.info("🎯 Available Commands:");
        logger.info("  • 'Check news' - Monitor latest crypto news");
        logger.info("  • 'Get latest news' - View recent news events");
        logger.info("  • 'Evaluate signal' - Analyze trading signals");
        logger.info("  • 'Get risk status' - View risk management metrics");
        logger.info("  • 'Optimize portfolio' - Get portfolio optimization recommendations");
        
        console.log("\n🚀 CryptoSentinel Trading Agent is running!");
        console.log("💡 You can interact with it using the IQAI Console or direct commands.");
        console.log("📊 The agent will automatically monitor news and provide trading insights.");

    } catch (error) {
        logger.error("Failed to start CryptoSentinel:", error);
        process.exit(1);
    }
}

main().catch(console.error);
