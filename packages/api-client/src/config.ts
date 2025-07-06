// API Client configuration

/**
 * API Client configuration options
 */
export interface ApiClientConfig {
  /** Base URL for the AI Agent API */
  baseUrl: string;
  /** WebSocket URL for real-time updates */
  wsUrl: string;
  /** Default request timeout in milliseconds */
  timeout?: number;
  /** API key for authentication (if required) */
  apiKey?: string;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Default API client configuration
 */
export const defaultConfig: ApiClientConfig = {
  baseUrl: 'http://localhost:3003/api',
  wsUrl: 'ws://localhost:3003',
  timeout: 10000,
  debug: false,
};

let currentConfig: ApiClientConfig = { ...defaultConfig };

/**
 * Configure the API client
 * @param config Configuration options
 */
export function configureApiClient(config: Partial<ApiClientConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
}

/**
 * Get the current API client configuration
 * @returns Current configuration
 */
export function getApiConfig(): ApiClientConfig {
  return { ...currentConfig };
}
