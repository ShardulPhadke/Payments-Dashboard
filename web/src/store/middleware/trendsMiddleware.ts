import { Middleware } from '@reduxjs/toolkit';
import { addPaymentEvent } from '../slices/paymentsWsSlice';
import { optimisticUpdateTrend } from '../slices/trendsSlice';
import { PaymentEvent, PaymentEventType } from '@payment/shared-types';

/**
 * Listens for WebSocket payment events and updates trend data optimistically
 */
export const trendsMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);

    if (addPaymentEvent.match(action)) {
        const { payment, type, timestamp } = action.payload;

        // Convert timestamp to Date safely
        const event: PaymentEvent = {
            type: type as PaymentEventType,
            payment,
            timestamp: new Date(timestamp), // always convert to Date
        };

        store.dispatch(optimisticUpdateTrend(event));
    }

    return result;
};
