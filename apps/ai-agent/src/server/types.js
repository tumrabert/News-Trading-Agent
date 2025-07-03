"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
/**
 * API error
 */
class ApiError extends Error {
    constructor(message, status = 500, code = 'internal_server_error', details) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
exports.ApiError = ApiError;
