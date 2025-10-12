'use client';

import { useState } from 'react';
import { useGetTrendsQuery } from '@/store/services/paymentsApi';
import { TrendPeriod } from '@payment/shared-types';
import {
    Card,
    CardContent,
    Typography,
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Skeleton,
    Alert,
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

export default function TrendChart() {
    const [period, setPeriod] = useState<TrendPeriod>(TrendPeriod.DAY);
    const { data, isLoading, error } = useGetTrendsQuery(period);
    console.log("Data: ", data);
    const handleChange = (
        _: React.MouseEvent<HTMLElement>,
        newPeriod: TrendPeriod | null
    ) => {
        if (newPeriod) setPeriod(newPeriod);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Payment Trends
                    </Typography>
                    <Skeleton variant="rectangular" width="100%" height={300} />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                Failed to load trend data. Please try again.
            </Alert>
        );
    }

    if (!data?.length) {
        return <Alert severity="info">No trend data available</Alert>;
    }

    return (
        <Card>
            <CardContent>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    flexWrap="wrap"
                    gap={2}
                >
                    <Typography variant="h6" component="h2" fontWeight="bold">
                        Payment Trends
                    </Typography>

                    <ToggleButtonGroup
                        value={period}
                        exclusive
                        onChange={handleChange}
                        size="small"
                        color="primary"
                    >
                        <ToggleButton value={TrendPeriod.DAY}>Day</ToggleButton>
                        <ToggleButton value={TrendPeriod.WEEK}>Week</ToggleButton>
                        <ToggleButton value={TrendPeriod.MONTH}>Month</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box height={360}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(ts) =>
                                    new Date(ts).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                    })
                                }
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(ts) =>
                                    new Date(ts).toLocaleString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                }
                                formatter={(value: number, name: string) => {
                                    if (name === 'Total Volume') return [`₹${value.toLocaleString('en-IN')}`, name];
                                    if (name === 'Success Rate (%)') return [`${value.toFixed(1)}%`, name];
                                    return [value, name];
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#1976d2"
                                strokeWidth={2}
                                dot={false}
                                name="Total Volume"
                            />
                            <Line
                                type="monotone"
                                dataKey="successRate"
                                stroke="#2e7d32"
                                strokeWidth={2}
                                dot={false}
                                name="Success Rate (%)"
                                yAxisId="right"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
}
