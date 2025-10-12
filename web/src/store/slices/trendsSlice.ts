import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrendData, TrendPeriod, Payment } from '@payment/shared-types';

export interface TrendEventForStore {
    type: string;
    payment: Payment;
    timestamp: string;
}

interface TrendsState {
    data: Array<{
        timestamp: string;
        amount: number;
        count: number;
        successRate: number;
    }>;
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
            state.data = action.payload.map(d => ({
                ...d,
                timestamp: d.timestamp instanceof Date ? d.timestamp.toISOString() : String(d.timestamp),
            }));
            state.isOptimistic = false;
            state.lastUpdated = new Date().toISOString();
        },

        setPeriod: (state, action: PayloadAction<TrendPeriod>) => {
            state.period = action.payload;
        },

        optimisticUpdateTrend: (state, action: PayloadAction<TrendEventForStore>) => {
            const event = action.payload;
            const ts = event.timestamp;

            let point = state.data[state.data.length - 1];

            if (!point || new Date(ts).getTime() - new Date(point.timestamp).getTime() > 1000 * 60) {
                point = { timestamp: ts, amount: 0, count: 0, successRate: 0 };
                state.data.push(point);
            }

            point.amount += event.payment.amount;
            point.count += 1;

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
