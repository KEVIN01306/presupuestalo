import React from 'react';
import { Stack } from '@mui/material';
import type { BudgetDashboardSummary } from '../../domain/interfaces/budget.interface';
import { GlobalProjectionCard } from './GlobalProjectionCard';
import { ItemProgressList } from './ItemProgressList';
import { MemberSegmentationTable } from './MemberSegmentationTable';
import { PersonalSummaryCard } from './PersonalSummaryCard';
import { DashboardChartsSection } from './charts/DashboardChartsSection';

interface BudgetSummaryTabProps {
    summary: BudgetDashboardSummary;
}

export const BudgetSummaryTab: React.FC<BudgetSummaryTabProps> = ({ summary }) => {
    return (
        <Stack sx={{ gap: 3 }}>
            <PersonalSummaryCard summary={summary.currentUserSummary} />
            <GlobalProjectionCard global={summary.global} />
            <DashboardChartsSection analytics={summary.analytics} />
            <MemberSegmentationTable rows={summary.userSegmentation} />
            <ItemProgressList items={summary.itemsProgress} />
        </Stack>
    );
};
