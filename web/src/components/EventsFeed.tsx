'use client';

import { useSelector } from 'react-redux';
import { useState, useRef } from 'react';
import type { RootState } from '@/store';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Paper,
    Divider,
} from '@mui/material';
import { CheckCircle, Cancel, Undo, Circle, FiberManualRecord } from '@mui/icons-material';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface EventItemProps {
    event: {
        type: string;
        payment: { method: string; amount: number; status: string };
        timestamp: string;
    };
}

export default function EventsFeed() {
    const events = useSelector((state: RootState) => state.paymentsWs.events);
    const connection = useSelector((state: RootState) => state.paymentsWs.connection);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);

    // Force scroll to top when auto-scroll is manually re-enabled
    const handleResumeAutoScroll = () => {
        setAutoScroll(true);
        if (virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' });
        }
    };

    return (
        <Card>
            <CardContent>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Live Payment Events</Typography>
                    <Box display="flex" gap={1} alignItems="center">
                        <ConnectionStatus status={connection?.status || 'disconnected'} />
                        <Chip
                            label={autoScroll && isAtTop ? 'Auto-scroll ON' : 'Back To Top'}
                            size="small"
                            color={autoScroll && isAtTop ? 'success' : 'default'}
                            onClick={() => handleResumeAutoScroll()}
                            sx={{ cursor: 'pointer' }}
                        />
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Virtualized list */}
                <Paper variant="outlined" sx={{ maxHeight: 400, bgcolor: 'grey.50' }}>
                    {events.length === 0 ? (
                        <Box p={3} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                No events yet. Waiting for payments...
                            </Typography>
                        </Box>
                    ) : (
                        <Virtuoso
                            ref={virtuosoRef}
                            style={{ height: 400 }}
                            data={events}
                            firstItemIndex={0}
                            initialTopMostItemIndex={0}
                            itemContent={(index, event) => <EventItem key={event.timestamp} event={event} />}
                            followOutput={autoScroll ? 'smooth' : false}
                            atTopStateChange={(atTop) => {
                                setIsAtTop(atTop);
                                if (atTop) setAutoScroll(true); // auto-resume when scrolled to top
                            }}
                        />
                    )}
                </Paper>

                {/* Footer */}
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                        {events.length} event{events.length !== 1 ? 's' : ''} received
                    </Typography>
                    {events.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            Latest: {formatTimestamp(events[0].timestamp)}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

/** Connection Status */
interface ConnectionStatusProps {
    status: 'connected' | 'disconnected' | 'error' | string;
}

function ConnectionStatus({ status }: ConnectionStatusProps) {
    const config = {
        connected: { label: 'Connected', color: 'success' as const, icon: <FiberManualRecord fontSize="small" /> },
        disconnected: { label: 'Disconnected', color: 'default' as const, icon: <Circle fontSize="small" /> },
        error: { label: 'Error', color: 'error' as const, icon: <Cancel fontSize="small" /> },
    };
    const { label, color, icon } = config[status as keyof typeof config] || config.disconnected;
    return <Chip label={label} color={color} size="small" icon={icon} />;
}

/** Event Item */
function EventItem({ event }: EventItemProps) {
    const statusConfig = {
        success: { icon: <CheckCircle fontSize="small" />, color: 'success.main' },
        failed: { icon: <Cancel fontSize="small" />, color: 'error.main' },
        refunded: { icon: <Undo fontSize="small" />, color: 'warning.main' },
    };
    const { icon, color } = statusConfig[event.payment.status as keyof typeof statusConfig] || statusConfig.success;

    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={2}
                py={1}
                sx={{ '&:hover': { bgcolor: 'action.hover' }, color }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    {icon}
                    <Typography variant="body2" fontWeight="medium">
                        {formatPaymentMethod(event.payment.method)}
                    </Typography>
                    <Chip
                        label={event.payment.status}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem', bgcolor: color, color: 'white' }}
                    />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="bold">
                        ₹{event.payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(event.timestamp)}
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ my: 0 }} />
        </>
    );
}

/** Helpers */
function formatPaymentMethod(method: string): string {
    const formatted = method.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
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