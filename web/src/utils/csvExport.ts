import { PaymentMetrics, TrendData } from '@payment/shared-types';

/**
 * CSV Export Utilities
 * 
 * Functions to export various data types to CSV format.
 */

/**
 * Convert data to CSV string
 */
function convertToCSV(data: any[], headers: string[]): string {
    const headerRow = headers.join(',');
    const dataRows = data.map((row) => {
        return headers.map((header) => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger browser download of CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Export metrics to CSV
 */
export function exportMetricsToCSV(metrics: PaymentMetrics, tenantId: string): void {
    const data = [
        {
            metric: 'Total Volume',
            value: `₹${metrics.totalVolume.toLocaleString('en-IN')}`,
            rawValue: metrics.totalVolume,
        },
        {
            metric: 'Total Count',
            value: metrics.totalCount.toLocaleString(),
            rawValue: metrics.totalCount,
        },
        {
            metric: 'Success Rate',
            value: `${metrics.successRate.toFixed(1)}%`,
            rawValue: metrics.successRate,
        },
        {
            metric: 'Average Amount',
            value: `₹${metrics.averageAmount.toLocaleString('en-IN')}`,
            rawValue: metrics.averageAmount,
        },
        {
            metric: 'Success Count',
            value: metrics.successCount.toLocaleString(),
            rawValue: metrics.successCount,
        },
        {
            metric: 'Failed Count',
            value: metrics.failedCount.toLocaleString(),
            rawValue: metrics.failedCount,
        },
        {
            metric: 'Refunded Count',
            value: metrics.refundedCount.toLocaleString(),
            rawValue: metrics.refundedCount,
        },
        {
            metric: 'Top Payment Method',
            value: metrics.topPaymentMethod,
            rawValue: metrics.topPaymentMethod,
        },
        {
            metric: 'Peak Hour',
            value: `${metrics.peakHour}:00`,
            rawValue: metrics.peakHour,
        },
    ];

    const csv = convertToCSV(data, ['metric', 'value', 'rawValue']);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `metrics-${tenantId}-${timestamp}.csv`);
}

/**
 * Export trends to CSV
 */
export function exportTrendsToCSV(
    trends: Array<{ timestamp: string | Date; amount: number; count: number; successRate: number }>,
    period: string,
    tenantId: string
): void {
    const data = trends.map((trend) => ({
        timestamp: new Date(trend.timestamp).toISOString(),
        date: new Date(trend.timestamp).toLocaleDateString('en-IN'),
        amount: trend.amount,
        count: trend.count,
        successRate: trend.successRate.toFixed(1),
    }));

    const csv = convertToCSV(data, ['timestamp', 'date', 'amount', 'count', 'successRate']);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `trends-${period}-${tenantId}-${timestamp}.csv`);
}

/**
 * Export events to CSV
 */
export function exportEventsToCSV(
    events: Array<{
        type: string;
        payment: { method: string; amount: number; status: string };
        timestamp: string;
    }>,
    tenantId: string
): void {
    const data = events.map((event) => ({
        timestamp: event.timestamp,
        date: new Date(event.timestamp).toLocaleString('en-IN'),
        type: event.type,
        method: event.payment.method,
        amount: event.payment.amount,
        status: event.payment.status,
    }));

    const csv = convertToCSV(data, ['timestamp', 'date', 'type', 'method', 'amount', 'status']);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `events-${tenantId}-${timestamp}.csv`);
}