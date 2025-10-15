/**
 * Runtime Environment Variable Utility
 * 
 * This utility allows accessing environment variables that are injected
 * at runtime by docker-entrypoint.sh, rather than at build time.
 * 
 * Usage:
 *   import { getEnv, ENV } from '@/utils/env';
 *   const apiUrl = ENV.API_URL;
 */

declare global {
    interface Window {
        _env_?: {
            NEXT_PUBLIC_API_URL?: string;
            NEXT_PUBLIC_WS_URL?: string;
            NEXT_PUBLIC_TENANT_ID?: string;
        };
    }
}

/**
 * Get environment variable with fallback to build-time env
 * @param key Environment variable key
 * @param fallback Fallback value if not found
 */
export function getEnv(key: string, fallback: string = ''): string {
    // Try runtime env from window._env_ (injected by docker-entrypoint.sh)
    if (typeof window !== 'undefined' && window._env_) {
        const runtimeValue = window._env_[key as keyof typeof window._env_];
        if (runtimeValue) return runtimeValue;
    }

    // Fallback to build-time env from process.env
    if (typeof process !== 'undefined' && process.env) {
        const buildTimeValue = process.env[key];
        if (buildTimeValue) return buildTimeValue;
    }

    return fallback;
}

/**
 * Export commonly used env vars with defaults
 */
export const ENV = {
    API_URL: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3333'),
    WS_URL: getEnv('NEXT_PUBLIC_WS_URL', 'ws://localhost:3333'),
    TENANT_ID: getEnv('NEXT_PUBLIC_TENANT_ID', 'tenant-alpha'),
};

/**
 * Check if we're running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if we're in browser context
 */
export const isBrowser = typeof window !== 'undefined';
