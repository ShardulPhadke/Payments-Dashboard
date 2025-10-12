import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMetrics, PaymentStatus } from '@payment/shared-types';

/**
 * Metrics Slice
 * 
 * Manages payment metrics with support for:
 * 1. Initial data from REST API
 * 2. Optimistic updates from WebSocket events
 * 3. Periodic reconciliation (re-fetch from API)
 * 
 * Flow:
 * - RTK Query fetches initial metrics → setMetrics()
 * - WebSocket events arrive → optimisticUpdate()
 * - Every 30s, re-fetch from API to reconcile
 */

interface MetricsState {
    data: PaymentMetrics | null;
    lastUpdated: string | null;
    isOptimistic: boolean; // True if any optimistic updates applied
}

const initialState: MetricsState = {
    data: null,
    lastUpdated: null,
    isOptimistic: false,
};

export const metricsSlice = createSlice({
    name: 'metrics',
    initialState,
    reducers: {
        /**
         * Set metrics from REST API (authoritative source)
         */
        setMetrics: (state, action: PayloadAction<PaymentMetrics>) => {
            state.data = action.payload;
            state.lastUpdated = new Date().toISOString();
            state.isOptimistic = false; // Reset optimistic flag
        },

        /**
         * Apply optimistic update from WebSocket event
         * 
         * Updates:
         * - totalVolume (add payment amount)
         * - totalCount (increment)
         * - successCount / failedCount / refundedCount (increment based on status)
         * - successRate (recalculate)
         * - averageAmount (recalculate)
         */
        optimisticUpdate: (
            state,
            action: PayloadAction<{
                totalVolume: number;
                totalCount: number;
                successCount: number;
                failedCount: number;
                refundedCount: number;
            }>
        ) => {
            if (!state.data) return;
            const { totalVolume, totalCount, successCount, failedCount, refundedCount } = action.payload;

            state.data.totalVolume += totalVolume;
            state.data.totalCount += totalCount;
            state.data.successCount += successCount;
            state.data.failedCount += failedCount;
            state.data.refundedCount += refundedCount;

            state.data.successRate =
                state.data.totalCount > 0
                    ? Math.round((state.data.successCount / state.data.totalCount) * 1000) / 10
                    : 0;

            state.data.averageAmount =
                state.data.totalCount > 0
                    ? Math.round(state.data.totalVolume / state.data.totalCount * 100) / 100
                    : 0;

            state.isOptimistic = true;
            state.lastUpdated = new Date().toISOString();
        },

        /**
         * Clear metrics (used on unmount or tenant change)
         */
        clearMetrics: (state) => {
            state.data = null;
            state.lastUpdated = null;
            state.isOptimistic = false;
        },
    },
});

export const { setMetrics, optimisticUpdate, clearMetrics } = metricsSlice.actions;

export default metricsSlice.reducer;