import { Middleware } from '@reduxjs/toolkit';
import { addPaymentEvent } from '../slices/paymentsWsSlice';
import { optimisticUpdateTrend, TrendEventForStore } from '../slices/trendsSlice';
import { PaymentEventType } from '@payment/shared-types';

/**
 * Trends Middleware
 *
 * - Buffers incoming payment events
 * - Flushes every `flushInterval` ms
 * - Dispatches batched optimistic updates
 */
export const trendsMiddleware: Middleware = (store) => {
    let buffer: TrendEventForStore[] = [];
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    const flushInterval = 1000; // adjust as needed

    const flushBuffer = () => {
        if (buffer.length === 0) return;

        // Dispatch each buffered event as an optimistic update
        buffer.forEach((evt) => {
            store.dispatch(optimisticUpdateTrend(evt));
        });

        buffer = [];
        flushTimer = null;
    };

    return (next) => (action) => {
        const result = next(action);

        if (addPaymentEvent.match(action)) {
            const { payment, type, timestamp } = action.payload;

            buffer.push({
                type: type as PaymentEventType,
                payment,
                timestamp: new Date(timestamp).toISOString(),
            });

            if (!flushTimer) {
                flushTimer = setTimeout(flushBuffer, flushInterval);
            }
        }

        return result;
    };
};
