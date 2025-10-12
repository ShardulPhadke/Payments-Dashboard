import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrendData, TrendPeriod, PaymentEvent } from '@payment/shared-types';

interface TrendsState {
    data: TrendData[];
    period: TrendPeriod;
    isOptimistic: boolean;
    lastUpdated: string | null;
}

const initialState: TrendsState = {
    data: [],
    period: TrendPeriod.DAY,
    isOptimistic: false,
    lastUpdated: null,
};

export const trendsSlice = createSlice({
    name: 'trends',
    initialState,
    reducers: {
        setTrends: (state, action: PayloadAction<TrendData[]>) => {
            state.data = action.payload;
            state.isOptimistic = false;
            state.lastUpdated = new Date().toISOString();
        },
        setPeriod: (state, action: PayloadAction<TrendPeriod>) => {
            state.period = action.payload;
        },
        optimisticUpdateTrend: (state, action: PayloadAction<PaymentEvent>) => {
            const event = action.payload;
            const ts = new Date(event.timestamp).getTime();

            let point = state.data[state.data.length - 1];
            // If no point or last point is older than 1 min, create a new one
            if (!point || ts - new Date(point.timestamp).getTime() > 1000 * 60) {
                point = { timestamp: new Date(ts), amount: 0, count: 0, successRate: 0 };
                state.data.push(point);
            }

            // Update values
            point.amount += event.payment.amount;
            point.count += 1;

            // Update success rate
            const prevSuccessCount = Math.round((point.successRate / 100) * (point.count - 1));
            const addedSuccess = event.payment.status === 'success' ? 1 : 0;
            const totalSuccess = prevSuccessCount + addedSuccess;
            point.successRate = (totalSuccess / point.count) * 100;

            state.isOptimistic = true;
            state.lastUpdated = new Date().toISOString();
        },
    },
});

export const { setTrends, optimisticUpdateTrend, setPeriod } = trendsSlice.actions;
export default trendsSlice.reducer;
