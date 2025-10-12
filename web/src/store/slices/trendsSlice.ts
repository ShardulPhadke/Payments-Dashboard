import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrendData, TrendPeriod, Payment } from '@payment/shared-types';

/**
 * Payment event stored in Redux trends slice
 * - timestamp is string (ISO) for serializability
 */
export interface TrendEventForStore {
    type: string; // PaymentEventType as string
    payment: Payment;
    timestamp: string; // ISO string
}

interface TrendsState {
    data: Array<{
        timestamp: string; // ISO string
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
        /**
         * Set trends from API (authoritative)
         */
        setTrends: (state, action: PayloadAction<TrendData[]>) => {
            state.data = action.payload.map(d => ({
                ...d,
                timestamp: d.timestamp instanceof Date ? d.timestamp.toISOString() : String(d.timestamp),
            }));
            state.isOptimistic = false;
            state.lastUpdated = new Date().toISOString();
        },

        /**
         * Change selected period (day/week/month)
         */
        setPeriod: (state, action: PayloadAction<TrendPeriod>) => {
            state.period = action.payload;
        },

        /**
         * Optimistic update when a new payment event arrives
         */
        optimisticUpdateTrend: (state, action: PayloadAction<TrendEventForStore>) => {
            const event = action.payload;

            // Use ISO string for timestamp
            const ts = event.timestamp;

            // Get the latest point
            let point = state.data[state.data.length - 1];

            // If no points yet or last point is older than 1 minute, create a new one
            if (!point || new Date(ts).getTime() - new Date(point.timestamp).getTime() > 1000 * 60) {
                point = { timestamp: ts, amount: 0, count: 0, successRate: 0 };
                state.data.push(point);
            }

            // Update values
            point.amount += event.payment.amount;
            point.count += 1;

            // Recalculate success rate
            const prevSuccessCount = Math.round((point.successRate / 100) * (point.count - 1));
            const addedSuccess = event.payment.status === 'success' ? 1 : 0;
            const totalSuccess = prevSuccessCount + addedSuccess;
            point.successRate = (totalSuccess / point.count) * 100;

            // Mark slice as optimistic
            state.isOptimistic = true;
            state.lastUpdated = new Date().toISOString();
        },
    },
});

export const { setTrends, optimisticUpdateTrend, setPeriod } = trendsSlice.actions;
export default trendsSlice.reducer;
