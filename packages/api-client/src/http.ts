// HTTP client for the AI Agent API
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiConfig } from './config.js';
import type {
  ApiResponse,
  AIAgent,
  AgentFilterParams,
  CreateAgentRequest,
  UpdateAgentRequest,
  SignalFilterParams,
  TradingSignal,
  ExecutionFilterParams,
  TradeExecution,
  AgentCommand,
  AgentPerformance,
  AgentActivity,
  RiskAlert,
  MarketNews
} from './types.js';

/**
 * HTTP client for the AI Agent API
 */
class HttpClient {
  private client: AxiosInstance | null = null;

  private getClient(): AxiosInstance {
    if (!this.client) {
      const config = getApiConfig();
      console.log('Creating HTTP client with config:', config);
      this.client = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeout,
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {})
        }
      });

      // Add response interceptor for error handling
      this.client.interceptors.response.use(
        (response) => response,
        (error) => {
          const config = getApiConfig();
          if (config.debug) {
            console.error('API Error:', error.response?.data || error.message);
          }
          return Promise.reject(error);
        }
      );
    }
    return this.client;
  }

  /**
   * Reset the client to pick up new configuration
   */
  resetClient(): void {
    this.client = null;
  }

  /**
   * Make a request to the API
   * @param config Axios request config
   * @returns API response
   */
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const client = this.getClient();
      const response: AxiosResponse<ApiResponse<T>> = await client(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data as ApiResponse<T>;
      }
      return {
        success: false,
        error: {
          code: 'request_failed',
          message: error.message || 'Request failed',
        }
      };
    }
  }

  // Agent endpoints

  /**
   * Get all agents
   * @param params Filter parameters
   * @returns List of agents
   */
  async getAgents(params?: AgentFilterParams): Promise<ApiResponse<AIAgent[]>> {
    return this.request<AIAgent[]>({
      method: 'GET',
      url: '/agents',
      params
    });
  }

  /**
   * Get agent by ID
   * @param id Agent ID
   * @returns Agent details
   */
  async getAgent(id: string): Promise<ApiResponse<AIAgent>> {
    return this.request<AIAgent>({
      method: 'GET',
      url: `/agents/${id}`
    });
  }

  /**
   * Create a new agent
   * @param data Agent data
   * @returns Created agent
   */
  async createAgent(data: CreateAgentRequest): Promise<ApiResponse<AIAgent>> {
    return this.request<AIAgent>({
      method: 'POST',
      url: '/agents',
      data
    });
  }

  /**
   * Update an agent
   * @param id Agent ID
   * @param data Agent data
   * @returns Updated agent
   */
  async updateAgent(id: string, data: UpdateAgentRequest): Promise<ApiResponse<AIAgent>> {
    return this.request<AIAgent>({
      method: 'PUT',
      url: `/agents/${id}`,
      data
    });
  }

  /**
   * Delete an agent
   * @param id Agent ID
   * @returns Success status
   */
  async deleteAgent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/agents/${id}`
    });
  }

  /**
   * Update agent status
   * @param id Agent ID
   * @param status New status
   * @returns Updated agent
   */
  async updateAgentStatus(id: string, status: 'active' | 'paused' | 'stopped'): Promise<ApiResponse<AIAgent>> {
    return this.request<AIAgent>({
      method: 'PUT',
      url: `/agents/${id}/status`,
      data: { status }
    });
  }

  /**
   * Send command to agent
   * @param command Agent command
   * @returns Command result
   */
  async sendAgentCommand(command: AgentCommand): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      url: `/agents/${command.agentId}/command`,
      data: command
    });
  }

  /**
   * Get agent performance
   * @param id Agent ID
   * @param period Performance period
   * @returns Agent performance
   */
  async getAgentPerformance(id: string, period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all'): Promise<ApiResponse<AgentPerformance>> {
    return this.request<AgentPerformance>({
      method: 'GET',
      url: `/agents/${id}/performance`,
      params: { period }
    });
  }

  /**
   * Get agent activity
   * @param id Agent ID
   * @param limit Number of activities to return
   * @returns Agent activities
   */
  async getAgentActivity(id: string, limit: number = 20): Promise<ApiResponse<AgentActivity[]>> {
    return this.request<AgentActivity[]>({
      method: 'GET',
      url: `/agents/${id}/activity`,
      params: { limit }
    });
  }

  // Signal endpoints

  /**
   * Get trading signals
   * @param params Filter parameters
   * @returns List of signals
   */
  async getSignals(params?: SignalFilterParams): Promise<ApiResponse<TradingSignal[]>> {
    return this.request<TradingSignal[]>({
      method: 'GET',
      url: '/signals',
      params
    });
  }

  /**
   * Get signal by ID
   * @param id Signal ID
   * @returns Signal details
   */
  async getSignal(id: string): Promise<ApiResponse<TradingSignal>> {
    return this.request<TradingSignal>({
      method: 'GET',
      url: `/signals/${id}`
    });
  }

  // Execution endpoints

  /**
   * Get trade executions
   * @param params Filter parameters
   * @returns List of executions
   */
  async getExecutions(params?: ExecutionFilterParams): Promise<ApiResponse<TradeExecution[]>> {
    return this.request<TradeExecution[]>({
      method: 'GET',
      url: '/executions',
      params
    });
  }

  /**
   * Get execution by ID
   * @param id Execution ID
   * @returns Execution details
   */
  async getExecution(id: string): Promise<ApiResponse<TradeExecution>> {
    return this.request<TradeExecution>({
      method: 'GET',
      url: `/executions/${id}`
    });
  }

  // Risk alerts

  /**
   * Get risk alerts
   * @param limit Number of alerts to return
   * @param includeAcknowledged Whether to include acknowledged alerts
   * @returns List of risk alerts
   */
  async getRiskAlerts(limit: number = 20, includeAcknowledged: boolean = false): Promise<ApiResponse<RiskAlert[]>> {
    return this.request<RiskAlert[]>({
      method: 'GET',
      url: '/risk/alerts',
      params: { limit, includeAcknowledged }
    });
  }

  /**
   * Acknowledge a risk alert
   * @param id Alert ID
   * @returns Success status
   */
  async acknowledgeRiskAlert(id: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/risk/alerts/${id}/acknowledge`
    });
  }

  // News

  /**
   * Get market news
   * @param limit Number of news items to return
   * @returns List of news items
   */
  async getMarketNews(limit: number = 20): Promise<ApiResponse<MarketNews[]>> {
    return this.request<MarketNews[]>({
      method: 'GET',
      url: '/news',
      params: { limit }
    });
  }
}

// Create singleton instance
const httpClient = new HttpClient();

export { httpClient, HttpClient };
