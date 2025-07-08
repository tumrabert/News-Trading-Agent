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

// Import server components
import { createServer } from "./server/index.js";
import { AgentManagerImpl } from "./server/agent-manager.js";

// Load environment variables
dotenv.config();

const logger = new Logger('CryptoSentinel');
// For development purposes, use a mock API key if not provided
const API_KEY: string = process.env.OPENAI_API_KEY || "mock-api-key-for-development";
const API_PORT: number = parseInt(process.env.API_PORT || '3003', 10);

async function main() {
    try {
        logger.info("🚀 Initializing CryptoSentinel Trading Agent...");

        // Create the agent manager
        const agentManager = new AgentManagerImpl(API_KEY);

        // Create and start the API server
        const server = createServer(agentManager, API_PORT);

        // Create a default agent
        const defaultAgent = await agentManager.createAgent({
            name: "CryptoSentinel",
            config: {
                riskLevel: 'medium', // Map 'moderate' to 'medium'
                maxPositionSize: defaultRiskConfig.maxPositionSize,
                stopLossPercentage: defaultRiskConfig.stopLossPercentage,
                takeProfitPercentage: 15, // Default take profit percentage
                maxDailyLoss: defaultRiskConfig.maxDailyLoss,
                maxDrawdown: 20, // 20% max drawdown
                maxOpenPositions: 5 // Maximum 5 open positions
            }
        });

        // Start the default agent
        await agentManager.updateAgentStatus(defaultAgent.id, 'active');

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
        
        logger.info("🌐 API Server Information:");
        logger.info(`  • API Server running on: http://localhost:${API_PORT}`);
        logger.info(`  • WebSocket Server running on: ws://localhost:${API_PORT}`);
        logger.info(`  • Health check endpoint: http://localhost:${API_PORT}/health`);
        
        logger.info("🔌 Available API Endpoints:");
        logger.info("  • GET    /api/agents - List all agents");
        logger.info("  • POST   /api/agents - Create a new agent");
        logger.info("  • GET    /api/agents/:id - Get agent details");
        logger.info("  • PUT    /api/agents/:id - Update agent");
        logger.info("  • DELETE /api/agents/:id - Delete agent");
        logger.info("  • PUT    /api/agents/:id/status - Update agent status");
        logger.info("  • GET    /api/signals - Get trading signals");
        logger.info("  • GET    /api/executions - Get trade executions");
        logger.info("  • GET    /api/risk/alerts - Get risk alerts");
        logger.info("  • GET    /api/news - Get market news");
        
        console.log("\n🚀 CryptoSentinel Trading Agent is running!");
        console.log("💡 You can interact with it using the API or WebSocket.");
        console.log("📊 The agent will automatically monitor news and provide trading signals.");
        console.log(`🌐 Frontend can connect to: http://localhost:${API_PORT}/api`);

    } catch (error) {
        logger.error("Failed to start CryptoSentinel:", error);
        process.exit(1);
    }
}

main().catch(console.error);
