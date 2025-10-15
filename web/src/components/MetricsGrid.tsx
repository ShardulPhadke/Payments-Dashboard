'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetMetricsQuery } from '@/store/services/paymentsApi';
import { setMetrics } from '@/store/slices/metricsSlice';
import type { RootState } from '@/store';
import { Grid } from '@mui/material';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Skeleton,
    Alert,
    Chip,
    Button,
    Tooltip,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    AttachMoney,
    CheckCircle,
    Cancel,
    Undo,
    Payment,
    Download,
    Visibility,
} from '@mui/icons-material';
import React from 'react';
import { exportMetricsToCSV } from '@/utils/csvExport';
import MetricDrilldownDialog from './MetricDrilldownDialog';
import { getEnv } from '@/utils/env';

export default function MetricsGrid() {
    const dispatch = useDispatch();
    const connection = useSelector((state: RootState) => state.paymentsWs.connection);
    const isSocketHealthy = connection?.status === 'connected';
    const { data: apiMetrics, isLoading, error } = useGetMetricsQuery(undefined, {
        pollingInterval: isSocketHealthy ? 0 : 30000,
    });

    const metricsState = useSelector((state: RootState) => state.metrics);
    const metrics = metricsState.data || apiMetrics;

    const [drilldownOpen, setDrilldownOpen] = useState(false);

    useEffect(() => {
        if (apiMetrics) {
            dispatch(setMetrics(apiMetrics));
        }
    }, [apiMetrics, dispatch]);

    const handleExport = () => {
        if (metrics) {
            exportMetricsToCSV(metrics, getEnv('NEXT_PUBLIC_TENANT_ID', 'tenant-alpha'));
        }
    };

    if (isLoading) {
        return (
            <Grid container spacing={3}>
                {[...Array(8)].map((_, i) => (
                    <Grid size={3} key={i}>
                        <MetricCardSkeleton />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                <Typography variant="h6">Error loading metrics</Typography>
                <Typography variant="body2">Failed to fetch payment metrics. Please try again.</Typography>
            </Alert>
        );
    }

    if (!metrics) {
        return <Alert severity="info">No metrics available</Alert>;
    }

    return (
        <Box>
            {/* Header with actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {metricsState.isOptimistic && (
                    <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="LIVE" color="primary" size="small" sx={{ animation: 'pulse 2s infinite' }} />
                            <Typography variant="body2">Live updates active</Typography>
                        </Box>
                    </Alert>
                )}
                <Box display="flex" gap={1} ml="auto">
                    <Tooltip title="View detailed breakdown">
                        <Button
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => setDrilldownOpen(true)}
                            size="small"
                        >
                            Details
                        </Button>
                    </Tooltip>
                    <Tooltip title="Export metrics to CSV">
                        <Button variant="outlined" startIcon={<Download />} onClick={handleExport} size="small">
                            Export CSV
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid size={3}>
                    <MetricCard
                        title="Total Volume"
                        value={`₹${metrics.totalVolume.toLocaleString('en-IN')}`}
                        subtitle={`${metrics.totalCount.toLocaleString()} payments`}
                        icon={<AttachMoney />}
                        trend={metricsState.isOptimistic ? 'up' : undefined}
                        color="primary"
                    />
                </Grid>

                <Grid size={3}>
                    <MetricCard
                        title="Success Rate"
                        value={`${metrics.successRate.toFixed(1)}%`}
                        subtitle={`${metrics.successCount.toLocaleString()} successful`}
                        icon={<CheckCircle />}
                        trend={metricsState.isOptimistic ? 'stable' : undefined}
                        color="success"
                    />
                </Grid>

                <Grid size={3}>
                    <MetricCard
                        title="Average Amount"
                        value={`₹${metrics.averageAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                        subtitle="per transaction"
                        icon={<Payment />}
                        color="secondary"
                    />
                </Grid>

                <Grid size={3}>
                    <MetricCard
                        title="Top Payment Method"
                        value={formatPaymentMethod(metrics.topPaymentMethod).toUpperCase()}
                        subtitle={`Peak hour: ${formatHour(metrics.peakHour)}`}
                        icon={<Payment />}
                        color="info"
                    />
                </Grid>

                <Grid size={3}>
                    <MetricCard
                        title="Failed Payments"
                        value={metrics.failedCount.toLocaleString()}
                        subtitle={`${((metrics.failedCount / metrics.totalCount) * 100).toFixed(1)}% of total`}
                        icon={<Cancel />}
                        trend={metricsState.isOptimistic ? 'up' : undefined}
                        color="error"
                    />
                </Grid>

                <Grid size={3}>
                    <MetricCard
                        title="Refunded Payments"
                        value={metrics.refundedCount.toLocaleString()}
                        subtitle={`${((metrics.refundedCount / metrics.totalCount) * 100).toFixed(1)}% of total`}
                        icon={<Undo />}
                        color="warning"
                    />
                </Grid>

                <Grid size={3}>
                    <MetricCard
                        title="Total Transactions"
                        value={metrics.totalCount.toLocaleString()}
                        subtitle="all time"
                        icon={<Payment />}
                        trend={metricsState.isOptimistic ? 'up' : undefined}
                        color="default"
                    />
                </Grid>

                <Grid size={3}>
                    <LastUpdatedCard lastUpdated={metricsState.lastUpdated} isOptimistic={metricsState.isOptimistic} />
                </Grid>
            </Grid>

            {/* Drilldown Dialog */}
            <MetricDrilldownDialog
                open={drilldownOpen}
                onClose={() => setDrilldownOpen(false)}
                metrics={metrics}
                title="Payment Metrics"
            />
        </Box>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
}

function MetricCard({ title, value, subtitle, icon, trend, color = 'default' }: MetricCardProps) {
    return (
        <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                        {trend && <TrendIndicator trend={trend} />}
                        {icon && (
                            <Box sx={{ color: color !== 'default' ? `${color}.main` : 'text.secondary', display: 'flex', alignItems: 'center' }}>
                                {icon}
                            </Box>
                        )}
                    </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold" color={color !== 'default' ? `${color}.main` : 'text.primary'} sx={{ mb: 1 }}>
                    {value}
                </Typography>
                {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
            </CardContent>
        </Card>
    );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
    const config = {
        up: { icon: <TrendingUp />, color: 'success.main' },
        down: { icon: <TrendingDown />, color: 'error.main' },
        stable: { icon: <TrendingFlat />, color: 'text.secondary' },
    };
    const { icon, color } = config[trend];
    return <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>;
}

function MetricCardSkeleton() {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={48} sx={{ my: 1 }} />
                <Skeleton variant="text" width="40%" height={20} />
            </CardContent>
        </Card>
    );
}

function LastUpdatedCard({ lastUpdated, isOptimistic }: { lastUpdated: string | null; isOptimistic: boolean }) {
    const [now, setNow] = React.useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(interval);
    }, []);
    const value = lastUpdated ? formatTimestamp(lastUpdated, now) : 'Never';
    const subtitle = isOptimistic ? 'Real-time' : 'From API';
    return <MetricCard title="Last Updated" value={value} subtitle={subtitle} icon={<TrendingFlat />} color="default" />;
}

function formatPaymentMethod(method: string): string {
    const formatted = method.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
}

function formatTimestamp(timestamp: string, nowMs: number = Date.now()): string {
    const date = new Date(timestamp);
    let diffMs = nowMs - date.getTime();
    if (diffMs < 0) diffMs = 0;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}