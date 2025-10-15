import { Middleware } from '@reduxjs/toolkit';
import { optimisticUpdateTrend } from '../slices/trendsSlice';
import type { RootState } from '../index';
import { addAlert } from '../slices/alertsSlice';
import type { TrendData } from '@payment/shared-types';

let lastHighVolumeAmount: number | null = null;
let lastFailureRateAlert: number | null = null;

export const alertsMiddleware: Middleware<{}, RootState> = storeAPI => next => action => {
    const result = next(action);

    if (optimisticUpdateTrend.match(action)) {
        const state = storeAPI.getState();
        const trends = state.trends.data;

        if (!trends.length) return result;

        const latestPoint: TrendData = trends[trends.length - 1];

        // ---- Failure spike detection ----
        const recentFailureRates: number[] = trends.slice(-10, -1).map((t: TrendData) => 100 - t.successRate);
        const avgFailure = recentFailureRates.length
            ? recentFailureRates.reduce((sum, val) => sum + val, 0) / recentFailureRates.length
            : 0;

        const failureRate = 100 - latestPoint.successRate;

        if (failureRate > avgFailure * 2 && failureRate > 10) {
            // Only alert if this failure rate is different from last alerted
            if (lastFailureRateAlert !== failureRate) {
                storeAPI.dispatch(
                    addAlert({
                        id: `failure-${Date.now()}`,
                        type: 'failureSpike',
                        message: `🚨 Failure rate spiked to ${failureRate.toFixed(1)}%!`,
                        timestamp: new Date().toISOString(),
                    })
                );
                lastFailureRateAlert = failureRate;
            }
        }

        // ---- High volume alert ----
        const volumeThreshold = 1_000_000;
        if (latestPoint.amount > volumeThreshold) {
            // Only alert if amount is different from last alerted
            if (lastHighVolumeAmount !== latestPoint.amount) {
                storeAPI.dispatch(
                    addAlert({
                        id: `volume-${Date.now()}`,
                        type: 'volumeThreshold',
                        message: `💰 High transaction volume: ₹${latestPoint.amount.toLocaleString()}`,
                        timestamp: new Date().toISOString(),
                    })
                );
                lastHighVolumeAmount = latestPoint.amount;
            }
        } else {
            // Reset lastHighVolumeAmount if latest is below threshold
            lastHighVolumeAmount = null;
        }
    }

    return result;
};
