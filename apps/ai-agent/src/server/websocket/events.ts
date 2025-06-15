// WebSocket event types for the AI Agent

/**
 * WebSocket event types
 */
export enum WebSocketEventType {
  // Agent events
  AGENT_STATUS = 'agent:status',
  AGENT_SIGNAL = 'agent:signal',
  AGENT_EXECUTION = 'agent:execution',
  AGENT_ERROR = 'agent:error',
  
  // Market events
  MARKET_UPDATE = 'market:update',
  
  // Risk events
  RISK_ALERT = 'risk:alert',
  
  // News events
  NEWS_UPDATE = 'news:update',
}

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  data: T;
  timestamp: string;
}
