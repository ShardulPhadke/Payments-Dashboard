// src/store/slices/alertsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Alert {
    id: string;
    type: 'failureSpike' | 'volumeThreshold';
    message: string;
    timestamp: string;
}

interface AlertsState {
    alerts: Alert[];
}

const initialState: AlertsState = {
    alerts: [],
};

export const alertsSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        addAlert: (state, action: PayloadAction<Alert>) => {
            state.alerts.push(action.payload);
        },
        clearAlerts: (state) => {
            state.alerts = [];
        },
    },
});

export const { addAlert, clearAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;
