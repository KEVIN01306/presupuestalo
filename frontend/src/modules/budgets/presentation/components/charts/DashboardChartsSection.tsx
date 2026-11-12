import React from 'react';
import { Box } from '@mui/material';
import type { BudgetDashboardAnalytics } from '../../../domain/interfaces/budget.interface';
import { DailySpendingLineChart } from './DailySpendingLineChart';
import { TopSpentItemsBarChart } from './TopSpentItemsBarChart';
import { WeekdaySpendingRadarChart } from './WeekdaySpendingRadarChart';

interface DashboardChartsSectionProps {
    analytics?: BudgetDashboardAnalytics;
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({ analytics }) => {
    if (!analytics) return null;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' },
                gap: { xs: 2, sm: 3 },
                width: '100%',
                minWidth: 0,
            }}
        >
            <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 12' }, minWidth: 0, width: '100%' }}>
                <DailySpendingLineChart data={analytics.dailySpendingByMember} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 6' }, minWidth: 0, width: '100%' }}>
                <WeekdaySpendingRadarChart data={analytics.weekdaySpending} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 6' }, minWidth: 0, width: '100%' }}>
                <TopSpentItemsBarChart data={analytics.topItems} />
            </Box>
        </Box>
    );
};
