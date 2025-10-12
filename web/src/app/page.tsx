'use client';

import MetricsGrid from '@/components/MetricsGrid';
import EventsFeed from '@/components/EventsFeed';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import TrendChart from '@/components/TrendChart';

/**
 * Dashboard Page (MUI)
 * 
 * Main dashboard displaying:
 * - Real-time metrics with optimistic updates
 * - Live events feed from WebSocket
 * - Connection status
 */
export default function DashboardPage() {
  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Payment Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Real-time payment monitoring and analytics
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Metrics Grid */}
        <Box mb={4}>
          <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
            Key Metrics
          </Typography>
          <MetricsGrid />
        </Box>

        {/* Trends Chart */}
         <Box mb={4}>
          <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
            Trends
          </Typography>
          <TrendChart />
        </Box>

        {/* Events Feed */}
        <Box>
          <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
            Live Payment Events
          </Typography>
          <EventsFeed />
        </Box>
      </Container>
    </Box>
  );
}