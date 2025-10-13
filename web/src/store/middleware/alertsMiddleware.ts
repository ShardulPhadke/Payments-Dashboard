import { Middleware } from '@reduxjs/toolkit';
import { optimisticUpdateTrend } from '../slices/trendsSlice';
import type { RootState } from '../index';
import { addAlert } from '../slices/alertsSlice';

const recentFailureRates: number[] = [];

export const alertsMiddleware = (storeAPI: { getState: () => RootState; dispatch: any }) => (next: any) => (action: any) => {
    const result = next(action);

    if (optimisticUpdateTrend.match(action)) {
        const state = storeAPI.getState();
        const trends = state.trends.data;
        if (!trends.length) return result;

        const latestPoint = trends[trends.length - 1];

        const failureRate = 100 - latestPoint.successRate;
        recentFailureRates.push(failureRate);
        if (recentFailureRates.length > 10) recentFailureRates.shift();

        const avgFailure =
            recentFailureRates.reduce((sum, val) => sum + val, 0) / recentFailureRates.length;

        if (failureRate > avgFailure * 2 && failureRate > 10) {
            storeAPI.dispatch(
                addAlert({
                    id: `failure-${Date.now()}`,
                    type: 'failureSpike',
                    message: `🚨 Failure rate spiked to ${failureRate.toFixed(1)}%!`,
                    timestamp: new Date().toISOString(),
                })
            );
        }

        const volumeThreshold = 100_000;
        if (latestPoint.amount > volumeThreshold) {
            storeAPI.dispatch(
                addAlert({
                    id: `volume-${Date.now()}`,
                    type: 'volumeThreshold',
                    message: `💰 High transaction volume: ₹${latestPoint.amount.toLocaleString()}`,
                    timestamp: new Date().toISOString(),
                })
            );
        }
    }

    return result;
};
