// src/components/AlertsToaster.tsx
'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Snackbar, Alert } from '@mui/material';
import { useState, useEffect } from 'react';

export default function AlertsToaster() {
    const alerts = useSelector((state: RootState) => state.alerts.alerts);
    const [openAlert, setOpenAlert] = useState<string | null>(null);

    useEffect(() => {
        if (alerts.length > 0) {
            setOpenAlert(alerts[alerts.length - 1].id);
        }
    }, [alerts]);

    const latest = alerts[alerts.length - 1];
    if (!latest) return null;

    return (
        <Snackbar
            open={!!openAlert}
            autoHideDuration={5000}
            onClose={() => setOpenAlert(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                severity={latest.type === 'failureSpike' ? 'error' : 'info'}
                onClose={() => setOpenAlert(null)}
                variant="filled"
            >
                {latest.message}
            </Alert>
        </Snackbar>
    );
}
