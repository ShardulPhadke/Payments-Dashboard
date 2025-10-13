import { configureStore } from '@reduxjs/toolkit';
import { paymentsApi } from './services/paymentsApi';
import paymentsWsReducer from './slices/paymentsWsSlice';
import metricsReducer from './slices/metricsSlice';
import trendsReducer from './slices/trendsSlice';
import alertsReducer from './slices/alertsSlice';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import { trendsMiddleware } from './middleware/trendsMiddleware';
import { alertsMiddleware } from './middleware/alertsMiddleware';

export const store = configureStore({
    reducer: {
        [paymentsApi.reducerPath]: paymentsApi.reducer,
        paymentsWs: paymentsWsReducer,
        metrics: metricsReducer,
        trends: trendsReducer,
        alerts: alertsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(paymentsApi.middleware)
            .concat(metricsMiddleware)
            .concat(trendsMiddleware)
            .concat(alertsMiddleware),
});

// Explicit types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
