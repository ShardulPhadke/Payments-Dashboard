import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrendData, TrendPeriod, Payment } from '@payment/shared-types';

export interface TrendEventForStore {
    type: string;
    payment: Payment;
    timestamp: string;
}

/**
 * Internal representation with raw counts
 * This prevents rounding errors when calculating success rate
 */
interface TrendPoint {
    timestamp: string; // normalized per period
    amount: number;
    count: number;
    successCount: number; // ✅ Store raw count, not percentage!
    successRate: number; // Computed from successCount/count
}

interface TrendsState {
    data: TrendPoint[];
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

/**
 * Normalize timestamp to start of period (day/week/month)
 * 
 * IMPORTANT: Always work in UTC to avoid timezone issues creating duplicate buckets
 */
function normalizeTimestamp(ts: string, period: TrendPeriod): string {
    const date = new Date(ts);

    switch (period) {
        case TrendPeriod.DAY:
            date.setUTCHours(0, 0, 0, 0);
            break;
        case TrendPeriod.WEEK: {
            const day = date.getUTCDay();
            const diff = (day + 6) % 7; // Monday = 0
            date.setUTCDate(date.getUTCDate() - diff);
            date.setUTCHours(0, 0, 0, 0);
            break;
        }
        case TrendPeriod.MONTH:
            date.setUTCDate(1);
            date.setUTCHours(0, 0, 0, 0);
            break;
    }

    return date.toISOString();
}

export const trendsSlice = createSlice({
    name: 'trends',
    initialState,
    reducers: {
        /**
         * Set trends from API (authoritative source)
         * 
         * Converts API data (which only has successRate) into internal format
         * with raw successCount for accurate optimistic updates.
         */
        setTrends: (state, action: PayloadAction<TrendData[]>) => {
            state.data = action.payload.map((d) => {
                const timestamp = d.timestamp instanceof Date
                    ? d.timestamp.toISOString()
                    : String(d.timestamp);

                // Calculate raw success count from rate
                // This is only done once when loading from API
                const successCount = Math.round((d.successRate / 100) * d.count);

                return {
                    timestamp,
                    amount: d.amount,
                    count: d.count,
                    successCount, // ✅ Store raw count
                    successRate: d.successRate,
                };
            });

            state.isOptimistic = false;
            state.lastUpdated = new Date().toISOString();
        },

        /**
         * Change the time period
         * Triggers re-fetch from API with new period
         */
        setPeriod: (state, action: PayloadAction<TrendPeriod>) => {
            state.period = action.payload;
            // Data will be cleared and refetched by RTK Query
            state.data = [];
            state.isOptimistic = false;
        },

        /**
         * Apply optimistic update from WebSocket event
         * 
         * FIXED: Uses raw successCount instead of deriving from percentage
         * This prevents compounding rounding errors
         */
        optimisticUpdateTrend: (state, action: PayloadAction<TrendEventForStore>) => {
            const event = action.payload;
            const normalizedTs = normalizeTimestamp(event.timestamp, state.period);

            // Find existing point or create new one
            let point = state.data.find((p) => p.timestamp === normalizedTs);

            if (!point) {
                // Create new point (shouldn't happen often, but handle it)
                point = {
                    timestamp: normalizedTs,
                    amount: 0,
                    count: 0,
                    successCount: 0,
                    successRate: 0,
                };
                state.data.push(point);

                // Sort by timestamp to maintain chronological order
                state.data.sort((a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
            }

            // ✅ Update using raw counts (no rounding errors!)
            point.amount += event.payment.amount;
            point.count += 1;

            if (event.payment.status === 'success') {
                point.successCount += 1;
            }

            // Recalculate success rate from raw counts
            point.successRate = point.count > 0
                ? Math.round((point.successCount / point.count) * 1000) / 10 // Round to 1 decimal
                : 0;

            state.isOptimistic = true;
            state.lastUpdated = new Date().toISOString();
        },

        /**
         * Clear trends (used when changing period)
         */
        clearTrends: (state) => {
            state.data = [];
            state.isOptimistic = false;
            state.lastUpdated = null;
        },
    },
});

export const { setTrends, optimisticUpdateTrend, setPeriod, clearTrends } = trendsSlice.actions;

export default trendsSlice.reducer;