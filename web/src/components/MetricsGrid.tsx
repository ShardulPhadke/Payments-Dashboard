'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetMetricsQuery } from '@/store/services/paymentsApi';
import { setMetrics } from '@/store/slices/metricsSlice';
import type { RootState } from '@/store';
import { Grid } from '@mui/material'; // Use Grid2
import {
    Card,
    CardContent,
    Typography,
    Box,
    Skeleton,
    Alert,
    Chip,
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
} from '@mui/icons-material';

/**
 * MetricsGrid Component (MUI)
 * 
 * Displays payment metrics with real-time optimistic updates.
 * Built with Material-UI components as per architecture spec.
 * 
 * Features:
 * - Fetches initial data from REST API
 * - Updates optimistically from WebSocket events
 * - Re-fetches every 30s for reconciliation
 * - Shows visual indicator when displaying optimistic data
 */
export default function MetricsGrid() {
    const dispatch = useDispatch();

    // Fetch metrics from API (with auto-refresh every 30s)
    const { data: apiMetrics, isLoading, error } = useGetMetricsQuery(undefined, {
        pollingInterval: 30000, // Re-fetch every 30 seconds
    });

    // Get optimistic metrics from Redux
    const metricsState = useSelector((state: RootState) => state.metrics);

    // Sync API data to Redux when it arrives
    useEffect(() => {
        if (apiMetrics) {
            dispatch(setMetrics(apiMetrics));
        }
    }, [apiMetrics, dispatch]);

    // Use optimistic metrics if available, otherwise use API data
    const metrics = metricsState.data || apiMetrics;

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
                <Typography variant="body2">
                    Failed to fetch payment metrics. Please try again.
                </Typography>
            </Alert>
        );
    }

    if (!metrics) {
        return (
            <Alert severity="info">No metrics available</Alert>
        );
    }

    return (
        <Box>
            {/* Optimistic indicator */}
            {metricsState.isOptimistic && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                            label="LIVE"
                            color="primary"
                            size="small"
                            sx={{ animation: 'pulse 2s infinite' }}
                        />
                        <Typography variant="body2">
                            Live updates active • Data syncs every 30s
                        </Typography>
                    </Box>
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Total Volume */}
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

                {/* Success Rate */}
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

                {/* Average Amount */}
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

                {/* Top Method */}
                <Grid size={3}>
                    <MetricCard
                        title="Top Payment Method"
                        value={formatPaymentMethod(metrics.topPaymentMethod).toUpperCase()}
                        subtitle={`Peak hour: ${formatHour(metrics.peakHour)}`}
                        icon={<Payment />}
                        color="info"
                    />
                </Grid>

                {/* Failed Payments */}
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

                {/* Refunded Payments */}
                <Grid size={3}>
                    <MetricCard
                        title="Refunded Payments"
                        value={metrics.refundedCount.toLocaleString()}
                        subtitle={`${((metrics.refundedCount / metrics.totalCount) * 100).toFixed(1)}% of total`}
                        icon={<Undo />}
                        color="warning"
                    />
                </Grid>

                {/* Total Transactions */}
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

                {/* Last Updated */}
                <Grid size={3}>
                    <MetricCard
                        title="Last Updated"
                        value={metricsState.lastUpdated ? formatTimestamp(metricsState.lastUpdated) : 'Never'}
                        subtitle={metricsState.isOptimistic ? 'Real-time' : 'From API'}
                        icon={<TrendingFlat />}
                        color="default"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

/**
 * MetricCard Component (MUI)
 */
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
        <Card
            sx={{
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                },
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                        {trend && <TrendIndicator trend={trend} />}
                        {icon && (
                            <Box
                                sx={{
                                    color: color !== 'default' ? `${color}.main` : 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {icon}
                            </Box>
                        )}
                    </Box>
                </Box>

                <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    color={color !== 'default' ? `${color}.main` : 'text.primary'}
                    sx={{ mb: 1 }}
                >
                    {value}
                </Typography>

                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Trend Indicator (MUI)
 */
function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
    const config = {
        up: { icon: <TrendingUp />, color: 'success.main' },
        down: { icon: <TrendingDown />, color: 'error.main' },
        stable: { icon: <TrendingFlat />, color: 'text.secondary' },
    };

    const { icon, color } = config[trend];

    return (
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
            {icon}
        </Box>
    );
}

/**
 * Skeleton Loader (MUI)
 */
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

/**
 * Helper Functions
 */
function formatPaymentMethod(method: string): string {
    const formatted = method.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
}

function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}