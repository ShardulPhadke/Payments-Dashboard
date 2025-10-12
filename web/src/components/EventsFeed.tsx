'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Chip,
    Paper,
    Divider,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Undo,
    Circle,
    FiberManualRecord,
} from '@mui/icons-material';

/**
 * EventsFeed Component (MUI)
 * 
 * Displays live payment events from WebSocket with connection status.
 * Built with Material-UI components.
 */
export default function EventsFeed() {
    const events = useSelector((state: RootState) => state.paymentsWs.events);
    const connection = useSelector((state: RootState) => state.paymentsWs.connection);

    return (
        <Card>
            <CardContent>
                {/* Header with connection status */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h3">
                        Live Payment Events
                    </Typography>
                    <ConnectionStatus status={connection?.status || 'disconnected'} />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Events list */}
                <Paper
                    variant="outlined"
                    sx={{
                        maxHeight: 400,
                        overflow: 'auto',
                        bgcolor: 'grey.50',
                    }}
                >
                    {events.length === 0 ? (
                        <Box p={3} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                No events yet. Waiting for payments...
                            </Typography>
                        </Box>
                    ) : (
                        <List dense>
                            {events.map((evt, idx) => (
                                <EventItem key={idx} event={evt} />
                            ))}
                        </List>
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

/**
 * Connection Status Indicator
 */
interface ConnectionStatusProps {
    status: 'connected' | 'disconnected' | 'error' | string;
}

function ConnectionStatus({ status }: ConnectionStatusProps) {
    const config = {
        connected: {
            label: 'Connected',
            color: 'success' as const,
            icon: <FiberManualRecord fontSize="small" />,
        },
        disconnected: {
            label: 'Disconnected',
            color: 'default' as const,
            icon: <Circle fontSize="small" />,
        },
        error: {
            label: 'Error',
            color: 'error' as const,
            icon: <Cancel fontSize="small" />,
        },
    };

    const { label, color, icon } = config[status as keyof typeof config] || config.disconnected;

    return (
        <Chip
            label={label}
            color={color}
            size="small"
            icon={icon}
            sx={{
                animation: status === 'connected' ? 'pulse 2s infinite' : undefined,
            }}
        />
    );
}

/**
 * Event Item
 */
interface EventItemProps {
    event: {
        type: string;
        payment: {
            method: string;
            amount: number;
            status: string;
        };
        timestamp: string;
    };
}

function EventItem({ event }: EventItemProps) {
    const statusConfig = {
        success: { icon: <CheckCircle fontSize="small" />, color: 'success.main' },
        failed: { icon: <Cancel fontSize="small" />, color: 'error.main' },
        refunded: { icon: <Undo fontSize="small" />, color: 'warning.main' },
    };

    const { icon, color } = statusConfig[event.payment.status as keyof typeof statusConfig] ||
        statusConfig.success;

    return (
        <>
            <ListItem
                sx={{
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <Box display="flex" alignItems="center" gap={1} mr={2} sx={{ color }}>
                    {icon}
                </Box>
                <ListItemText
                    primary={
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="medium">
                                {formatPaymentMethod(event.payment.method)}
                            </Typography>
                            <Chip
                                label={event.payment.status}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: color,
                                    color: 'white',
                                }}
                            />
                        </Box>
                    }
                    secondary={
                        <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(event.timestamp)}
                        </Typography>
                    }
                />
                <Typography variant="body2" fontWeight="bold">
                    ₹{event.payment.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </Typography>
            </ListItem>
            <Divider variant="inset" component="li" />
        </>
    );
}

/**
 * Helper Functions
 */
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