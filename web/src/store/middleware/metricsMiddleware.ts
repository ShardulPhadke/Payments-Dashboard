import { Middleware } from '@reduxjs/toolkit';
import { addPaymentEvent } from '../slices/paymentsWsSlice';
import { optimisticUpdate } from '../slices/metricsSlice';

/**
 * Metrics Middleware
 * 
 * Listens to WebSocket payment events and applies optimistic updates to metrics.
 * 
 * Flow:
 * 1. WebSocket receives payment event
 * 2. paymentsWsSlice stores it in events array
 * 3. This middleware catches the action
 * 4. Extracts amount and status
 * 5. Dispatches optimisticUpdate to metricsSlice
 * 
 * Benefits:
 * - Real-time metrics without API calls
 * - Feels instant to the user
 * - Reconciled with authoritative data periodically
 */
export const metricsMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);

    // Listen for payment events being added
    if (addPaymentEvent.match(action)) {
        const { payment } = action.payload;

        // Dispatch optimistic update to metrics
        store.dispatch(
            optimisticUpdate({
                amount: payment.amount,
                status: payment.status,
            })
        );
    }

    return result;
};