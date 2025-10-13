'use client';

import { useEffect, useState } from 'react';
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
    Button,
    Tooltip,
    IconButton,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { RootState } from '@/store';
import { Download, Fullscreen } from '@mui/icons-material';
import { exportTrendsToCSV } from '@/utils/csvExport';
import FullScreenChartDialog from './FullScreenChartDialog';

export default function TrendChart() {
    const dispatch = useDispatch();
    const trendState = useSelector((state: RootState) => state.trends);
    const { period, data, isOptimistic } = trendState;

    const connection = useSelector((state: RootState) => state.paymentsWs.connection);
    const isSocketHealthy = connection?.status === 'connected';
    const { data: apiData, isLoading, error } = useGetTrendsQuery(period, {
        pollingInterval: isSocketHealthy ? 0 : 30000,
    });

    const [fullScreenOpen, setFullScreenOpen] = useState(false);

    useEffect(() => {
        if (apiData) {
            dispatch(setTrends(apiData));
        }
    }, [apiData, dispatch]);

    const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: TrendPeriod | null) => {
        if (newPeriod) {
            dispatch(setPeriod(newPeriod));
        }
    };

    const handleExport = () => {
        if (data) {
            exportTrendsToCSV(data, period, process.env.NEXT_PUBLIC_TENANT_ID ?? "tenant-alpha");
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Payment Trends
                    </Typography>
                    <Skeleton variant="rectangular" width="100%" height={400} />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return <Alert severity="error">Failed to load trend data. Please try again.</Alert>;
    }

    if (!data?.length) {
        return <Alert severity="info">No trend data available for the selected period</Alert>;
    }

    const chartContent = (
        <>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Total Volume & Transaction Count
                    </Typography>
                    <Box height={fullScreenOpen ? 500 : 350}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    style={{ fontSize: 12 }}
                                />
                                <YAxis yAxisId="left" width={80} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`} style={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" width={60} tickFormatter={(val) => val.toLocaleString()} style={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    labelFormatter={(ts) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    formatter={(value: number, name: string) => {
                                        if (name === 'Volume') return [`₹${value.toLocaleString('en-IN')}`, 'Volume'];
                                        return [value.toLocaleString(), 'Count'];
                                    }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: 4 }}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Volume" />
                                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#9c27b0" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Count" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Success Rate (%)
                    </Typography>
                    <Box height={fullScreenOpen ? 400 : 300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    style={{ fontSize: 12 }}
                                />
                                <YAxis width={60} tickFormatter={(val) => `${val.toFixed(0)}%`} domain={[0, 100]} style={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    labelFormatter={(ts) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: 4 }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="successRate" stroke="#2e7d32" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Success Rate" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </>
    );

    return (
        <Box display="flex" flexDirection="column" gap={4}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h6" component="h2" fontWeight="bold">
                    Payment Trends
                </Typography>

                <Box display="flex" gap={2} alignItems="center">
                    <ToggleButtonGroup value={period} exclusive onChange={handlePeriodChange} size="small" color="primary">
                        <ToggleButton value={TrendPeriod.DAY}>Day</ToggleButton>
                        <ToggleButton value={TrendPeriod.WEEK}>Week</ToggleButton>
                        <ToggleButton value={TrendPeriod.MONTH}>Month</ToggleButton>
                    </ToggleButtonGroup>

                    <Tooltip title="Export to CSV">
                        <Button variant="outlined" startIcon={<Download />} onClick={handleExport} size="small">
                            Export
                        </Button>
                    </Tooltip>

                    <Tooltip title="View fullscreen">
                        <IconButton onClick={() => setFullScreenOpen(true)} color="primary">
                            <Fullscreen />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* LIVE indicator */}
            {isOptimistic && (
                <Alert severity="info">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Chip label="LIVE" color="primary" size="small" sx={{ animation: 'pulse 2s infinite' }} />
                        <Typography variant="body2">Live updates active</Typography>
                    </Box>
                </Alert>
            )}

            {/* Charts */}
            {chartContent}

            {/* Full-screen dialog */}
            <FullScreenChartDialog
                open={fullScreenOpen}
                onClose={() => setFullScreenOpen(false)}
                title={`Payment Trends - ${period.charAt(0).toUpperCase() + period.slice(1)}ly View`}
            >
                {chartContent}
            </FullScreenChartDialog>
        </Box>
    );
}