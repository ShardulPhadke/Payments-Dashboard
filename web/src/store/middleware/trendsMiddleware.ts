import { Middleware } from '@reduxjs/toolkit';
import { addPaymentEvent } from '../slices/paymentsWsSlice';
import { optimisticUpdateTrend, TrendEventForStore } from '../slices/trendsSlice';
import { PaymentEventType } from '@payment/shared-types';

/**
 * Trends Middleware
 *
 * Buffers incoming payment events and flushes them every flushInterval ms
 * to avoid too many Redux updates and re-renders.
 * 
 * Flow:
 * 1. WebSocket event arrives → addPaymentEvent action
 * 2. This middleware catches it and adds to buffer
 * 3. After flushInterval, all buffered events are dispatched as optimisticUpdateTrend
 * 4. TrendChart re-renders once with all updates
 */
export const trendsMiddleware: Middleware = (store) => {
    let buffer: TrendEventForStore[] = [];
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    const flushInterval = 1000; // 1 second batching

    const flushBuffer = () => {
        if (buffer.length === 0) return;

        // Dispatch all buffered events
        buffer.forEach((evt) => {
            store.dispatch(optimisticUpdateTrend(evt));
        });

        // Clear buffer
        buffer = [];
        flushTimer = null;
    };

    return (next) => (action) => {
        const result = next(action);

        // Listen for payment events from WebSocket
        if (addPaymentEvent.match(action)) {
            const { payment, type, timestamp } = action.payload;

            // Ensure timestamp is ISO string
            // timestamp is already a string from PaymentEventForStore
            const isoTs = typeof timestamp === 'string'
                ? new Date(timestamp).toISOString()
                : timestamp;

            // Add to buffer
            buffer.push({
                type: type as PaymentEventType,
                payment,
                timestamp: isoTs,
            });

            // Schedule flush if not already scheduled
            if (!flushTimer) {
                flushTimer = setTimeout(flushBuffer, flushInterval);
            }
        }

        return result;
    };
};