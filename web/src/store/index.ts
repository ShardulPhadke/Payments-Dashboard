import { configureStore } from '@reduxjs/toolkit';
import { paymentsApi } from './services/paymentsApi';
import paymentsWsReducer from './slices/paymentsWsSlice';
import metricsReducer from './slices/metricsSlice';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import trendsReducer from './slices/trendsSlice';
import { trendsMiddleware } from './middleware/trendsMiddleware';

export const store = configureStore({
    reducer: {
        [paymentsApi.reducerPath]: paymentsApi.reducer,
        paymentsWs: paymentsWsReducer,
        metrics: metricsReducer,
        trends: trendsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(paymentsApi.middleware)
            .concat(metricsMiddleware)
            .concat(trendsMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
