'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Stack } from '@mui/material';

export default function SimulatorControls() {
    const [paymentsPerMinute, setPaymentsPerMinute] = useState(10);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const TENANT_ID = 'tenant-alpha'; // Replace with dynamic tenant if needed

    const handleStart = async () => {
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const res = await fetch('http://localhost:3333/api/simulator/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-Id': TENANT_ID,
                },
                body: JSON.stringify({ paymentsPerMinute }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to start simulator');
            setMessage(`Simulator started: ${data.paymentsPerMinute} payments/min`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const res = await fetch('http://localhost:3333/api/simulator/stop-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-Id': TENANT_ID,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to stop simulator');
            setMessage(`Simulator stopped. Count: ${data.count}`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3} border={1} borderRadius={2} borderColor="grey.300" bgcolor="grey.50">
            <Typography variant="h6" mb={2}>Simulator Controls</Typography>

            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <TextField
                    label="Payments per Minute"
                    type="number"
                    size="small"
                    value={paymentsPerMinute}
                    onChange={(e) => setPaymentsPerMinute(Number(e.target.value))}
                    disabled={loading}
                />
                <Button variant="contained" color="primary" onClick={handleStart} disabled={loading}>
                    Start
                </Button>
                <Button variant="outlined" color="error" onClick={handleStop} disabled={loading}>
                    Stop
                </Button>
            </Stack>

            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
    );
}
