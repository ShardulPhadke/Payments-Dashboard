'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Table,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { PaymentMetrics } from '@payment/shared-types';

interface MetricDrilldownDialogProps {
    open: boolean;
    onClose: () => void;
    metrics: PaymentMetrics | null;
    title: string;
}

/**
 * Metric Drilldown Dialog
 * 
 * Shows detailed breakdown of a specific metric when clicked.
 */
export default function MetricDrilldownDialog({
    open,
    onClose,
    metrics,
    title,
}: MetricDrilldownDialogProps) {
    if (!metrics) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 },
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                        {title} - Detailed Breakdown
                    </Typography>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        sx={{ minWidth: 'auto', p: 1 }}
                    >
                        <Close />
                    </Button>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    {/* Overview Section */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Overview
                        </Typography>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell><strong>Total Volume</strong></TableCell>
                                    <TableCell align="right">
                                        ₹{metrics.totalVolume.toLocaleString('en-IN')}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><strong>Total Transactions</strong></TableCell>
                                    <TableCell align="right">
                                        {metrics.totalCount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><strong>Average Transaction</strong></TableCell>
                                    <TableCell align="right">
                                        ₹{metrics.averageAmount.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Status Breakdown */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Status Breakdown
                        </Typography>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell><strong>Successful</strong></TableCell>
                                    <TableCell align="right">
                                        {metrics.successCount.toLocaleString()} ({metrics.successRate.toFixed(1)}%)
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><strong>Failed</strong></TableCell>
                                    <TableCell align="right">
                                        {metrics.failedCount.toLocaleString()} (
                                        {((metrics.failedCount / metrics.totalCount) * 100).toFixed(1)}%)
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><strong>Refunded</strong></TableCell>
                                    <TableCell align="right">
                                        {metrics.refundedCount.toLocaleString()} (
                                        {((metrics.refundedCount / metrics.totalCount) * 100).toFixed(1)}%)
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Additional Insights */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Additional Insights
                        </Typography>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell><strong>Top Payment Method</strong></TableCell>
                                    <TableCell align="right">
                                        {metrics.topPaymentMethod.replace(/_/g, ' ').toUpperCase()}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><strong>Peak Activity Hour</strong></TableCell>
                                    <TableCell align="right">
                                        {metrics.peakHour}:00 {metrics.peakHour >= 12 ? 'PM' : 'AM'}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}