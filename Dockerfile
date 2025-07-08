FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/ai-agent/package.json ./apps/ai-agent/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build applications
RUN pnpm run build

# Verify the main file exists
RUN test -f apps/ai-agent/dist/index.js || (echo "Main file not found!" && exit 1)

# Expose port
EXPOSE 3003

# Set environment
ENV NODE_ENV=production
ENV PORT=3003

# Start the application
CMD ["node", "apps/ai-agent/dist/index.js"]