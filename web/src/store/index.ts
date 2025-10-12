import { configureStore } from '@reduxjs/toolkit';
import { paymentsApi } from './services/paymentsApi';
import paymentsWsReducer from './slices/paymentsWsSlice';
import metricsReducer from './slices/metricsSlice';
import { metricsMiddleware } from './middleware/metricsMiddleware';

/**
 * Redux Store Configuration
 * 
 * Combines:
 * - RTK Query (paymentsApi) - REST API calls
 * - paymentsWsSlice - WebSocket events
 * - metricsSlice - Metrics with optimistic updates
 * - metricsMiddleware - Bridges WebSocket → Metrics
 */
export const store = configureStore({
    reducer: {
        [paymentsApi.reducerPath]: paymentsApi.reducer,
        paymentsWs: paymentsWsReducer,
        metrics: metricsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(paymentsApi.middleware)
            .concat(metricsMiddleware) // Add metrics middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;