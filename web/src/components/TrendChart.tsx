'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetTrendsQuery } from '@/store/services/paymentsApi';
import { TrendPeriod } from '@payment/shared-types';
import { setTrends, setPeriod } from '@/store/slices/trendsSlice';
import {
    Card,
    CardContent,
    Typography,
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Skeleton,
    Alert,
    Chip,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import type { RootState } from '@/store';

export default function TrendChart() {
    const dispatch = useDispatch();
    const trendState = useSelector((state: RootState) => state.trends);
    const { period, data, isOptimistic } = trendState;

    // Fetch trends from API (reconciliation)
    const { data: apiData, isLoading, error } = useGetTrendsQuery(period);

    useEffect(() => {
        if (apiData) {
            dispatch(setTrends(apiData));
        }
    }, [apiData, dispatch]);

    const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: TrendPeriod | null) => {
        if (newPeriod) dispatch(setPeriod(newPeriod));
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Payment Trends
                    </Typography>
                    <Skeleton variant="rectangular" width="100%" height={700} />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return <Alert severity="error">Failed to load trend data. Please try again.</Alert>;
    }

    if (!data?.length) {
        return <Alert severity="info">No trend data available</Alert>;
    }

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            {/* Header and period toggle */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h6" component="h2" fontWeight="bold">
                    Payment Trends
                </Typography>

                <ToggleButtonGroup value={period} exclusive onChange={handlePeriodChange} size="small" color="primary">
                    <ToggleButton value={TrendPeriod.DAY}>Day</ToggleButton>
                    <ToggleButton value={TrendPeriod.WEEK}>Week</ToggleButton>
                    <ToggleButton value={TrendPeriod.MONTH}>Month</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Optimistic LIVE indicator */}
            {isOptimistic && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Chip label="LIVE" color="primary" size="small" sx={{ animation: 'pulse 2s infinite' }} />
                        <Typography variant="body2">Live updates active • Data reconciles from API periodically</Typography>
                    </Box>
                </Alert>
            )}

            {/* Total Volume Chart */}
            <Card>
                <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Total Volume
                    </Typography>
                    <Box height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(ts) =>
                                        new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                    }
                                />
                                <YAxis width={80} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                                <Tooltip
                                    labelFormatter={(ts) =>
                                        new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                    }
                                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#1976d2" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* Success Rate Chart */}
            <Card>
                <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Success Rate (%)
                    </Typography>
                    <Box height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(ts) =>
                                        new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                    }
                                />
                                <YAxis width={60} tickFormatter={(val) => `${val.toFixed(1)}%`} domain={[0, 100]} />
                                <Tooltip
                                    labelFormatter={(ts) =>
                                        new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                    }
                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                />
                                <Line type="monotone" dataKey="successRate" stroke="#2e7d32" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
