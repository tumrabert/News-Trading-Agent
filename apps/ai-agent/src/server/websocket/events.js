"use strict";
// WebSocket event types for the AI Agent
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketEventType = void 0;
/**
 * WebSocket event types
 */
var WebSocketEventType;
(function (WebSocketEventType) {
    // Agent events
    WebSocketEventType["AGENT_STATUS"] = "agent:status";
    WebSocketEventType["AGENT_SIGNAL"] = "agent:signal";
    WebSocketEventType["AGENT_EXECUTION"] = "agent:execution";
    WebSocketEventType["AGENT_ERROR"] = "agent:error";
    // Market events
    WebSocketEventType["MARKET_UPDATE"] = "market:update";
    // Risk events
    WebSocketEventType["RISK_ALERT"] = "risk:alert";
    // News events
    WebSocketEventType["NEWS_UPDATE"] = "news:update";
})(WebSocketEventType || (exports.WebSocketEventType = WebSocketEventType = {}));
