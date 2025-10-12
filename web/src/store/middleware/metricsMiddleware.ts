// metricsMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { addPaymentEvent } from '../slices/paymentsWsSlice';
import { optimisticUpdate } from '../slices/metricsSlice';
import type { PaymentStatus } from '@payment/shared-types';

/**
 * Metrics Middleware with batching and throttling
 *
 * - Accumulates incoming payment events in a buffer
 * - Flushes the buffer every `flushInterval` ms
 * - Dispatches a single `optimisticUpdate` for all buffered events
 */
export const metricsMiddleware: Middleware = (store) => {
    // Buffer for accumulating events
    let buffer: { amount: number; status: PaymentStatus }[] = [];

    // Timer to flush the buffer
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    // Throttle interval (milliseconds)
    const flushInterval = 1000; // adjust as needed

    // Flush function
    const flushBuffer = () => {
        if (buffer.length === 0) return;

        // Aggregate totals
        let totalAmount = 0;
        let successCount = 0;
        let failedCount = 0;
        let refundedCount = 0;

        buffer.forEach((evt) => {
            totalAmount += evt.amount;
            if (evt.status === 'success') successCount += 1;
            else if (evt.status === 'failed') failedCount += 1;
            else if (evt.status === 'refunded') refundedCount += 1;
        });

        // Dispatch a single optimistic update with aggregated data
        store.dispatch(
            optimisticUpdate({
                totalVolume: totalAmount,
                totalCount: buffer.length,
                successCount,
                failedCount,
                refundedCount,
            })
        );

        // Clear buffer
        buffer = [];
        flushTimer = null;
    };

    return (next) => (action) => {
        const result = next(action);

        if (addPaymentEvent.match(action)) {
            const { payment } = action.payload;

            // Add to buffer
            buffer.push({ amount: payment.amount, status: payment.status });

            // Start flush timer if not already scheduled
            if (!flushTimer) {
                flushTimer = setTimeout(flushBuffer, flushInterval);
            }
        }

        return result;
    };
};
