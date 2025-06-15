# Onchain Signal Platform

This monorepo contains the Onchain Signal platform, which consists of an AI agent for crypto trading signals and a frontend application to interact with the agent.

## Project Structure

- `apps/ai-agent`: The AI agent application that generates trading signals
- `apps/frontend`: The frontend application that displays trading signals and allows users to interact with the AI agent
- `packages/shared-types`: Shared TypeScript types used by both applications
- `packages/api-client`: API client for communicating with the AI agent

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Build the shared packages:

```bash
pnpm run build:shared
pnpm run build:api-client
```

## Running the Applications

### Development Mode

To run both the AI agent and frontend in development mode:

```bash
pnpm run dev:all
```

This will start:
- The AI agent on port 3003
- The frontend on port 3002

You can also run them separately:

```bash
# Run the AI agent
cd apps/ai-agent
PORT=3003 pnpm run dev

# Run the frontend
cd apps/frontend
pnpm run dev
```

### Production Mode

To build the applications for production:

```bash
pnpm run build
```

To start the applications in production mode:

```bash
pnpm run start
```

## API Endpoints

The AI agent exposes the following API endpoints:

- `GET /api/agents` - List all agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `PUT /api/agents/:id/status` - Update agent status
- `GET /api/signals` - Get trading signals
- `GET /api/executions` - Get trade executions
- `GET /api/risk/alerts` - Get risk alerts
- `GET /api/news` - Get market news

## WebSocket Events

The AI agent also provides real-time updates via WebSocket:

- `agent:status` - Agent status updates
- `agent:signal` - New trading signals
- `agent:execution` - Trade execution updates
- `risk:alert` - Risk alerts
- `market:news` - Market news updates

## Development Notes

- The AI agent uses a mock implementation in development mode to avoid dependencies on external services.
- The frontend connects to the AI agent via the API client, which is configured to use the correct port.
- The authentication system is currently mocked and will accept any credentials in development mode.
