import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Snackbar, Stack, Tab, Tabs } from '@mui/material';
import { ArrowBackOutlined } from '@mui/icons-material';
import { formatDate } from '../../../../core/utils/formatDate';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { BudgetClosingTab } from '../components/BudgetClosingTab';
import { BudgetExpensesTab } from '../components/BudgetExpensesTab';
import { BudgetIncomesTab } from '../components/BudgetIncomesTab';
import { BudgetItemsTab } from '../components/BudgetItemsTab';
import { BudgetStatusChip } from '../components/BudgetStatusChip';
import { BudgetSummaryTab } from '../components/BudgetSummaryTab';
import { useBudgetDetail } from '../hooks/useBudgetDetail';

export const BudgetDetailPage: React.FC = () => {
    const { budgetId } = useParams<{ budgetId: string }>();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const {
        currentUserId,
        summary,
        teamMembers,
        categories,
        incomes,
        items,
        expenses,
        loading,
        canEdit,
        isRoleEditable,
        toast,
        clearToast,
        saveIncome,
        deleteIncome,
        saveItem,
        deleteItem,
        saveExpense,
        deleteExpense,
        closeBudget,
    } = useBudgetDetail(budgetId);

    if (loading && !summary) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
    }

    if (!summary) {
        return <Alert severity="warning">No se encontró el presupuesto solicitado.</Alert>;
    }

    return (
        <Box>
            <Button startIcon={<ArrowBackOutlined />} onClick={() => navigate('/budgets')} sx={{ mb: 1, textTransform: 'none', color: '#5f6368' }}>
                Volver a presupuestos
            </Button>
            <PageHeader
                title={summary.budget.name}
                subtitle={`${formatDate(summary.budget.startDate)} — ${formatDate(summary.budget.endDate)}`}
            >
                <BudgetStatusChip status={summary.budget.status} />
            </PageHeader>

            <Box sx={{ borderBottom: '1px solid #dadce0', mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                    <Tab label="Resumen & Progreso" />
                    <Tab label="Ingresos" />
                    <Tab label="Rubros Proyectados" />
                    <Tab label="Gastos Reales" />
                    <Tab label="Cierre y Ahorro" />
                </Tabs>
            </Box>

            <Stack sx={{ gap: 3 }}>
                {tab === 0 && <BudgetSummaryTab summary={summary} />}
                {tab === 1 && (
                    <BudgetIncomesTab
                        incomes={incomes}
                        totalIncome={summary.global.totalIncome}
                        categories={categories}
                        members={teamMembers}
                        defaultUserId={currentUserId}
                        canEdit={canEdit}
                        onSave={saveIncome}
                        onDelete={deleteIncome}
                    />
                )}
                {tab === 2 && (
                    <BudgetItemsTab
                        items={items}
                        totalIncome={summary.global.totalIncome}
                        totalProjected={summary.global.totalProjected}
                        members={teamMembers}
                        canEdit={canEdit}
                        onSave={saveItem}
                        onDelete={deleteItem}
                    />
                )}
                {tab === 3 && (
                    <BudgetExpensesTab
                        expenses={expenses}
                        items={items}
                        members={teamMembers}
                        defaultUserId={currentUserId}
                        canEdit={canEdit}
                        onSave={saveExpense}
                        onDelete={deleteExpense}
                    />
                )}
                {tab === 4 && (
                    <BudgetClosingTab summary={summary} canEdit={isRoleEditable} onCloseBudget={closeBudget} />
                )}
            </Stack>

            <Snackbar open={!!toast} autoHideDuration={4000} onClose={clearToast}>
                <Alert severity={toast?.severity ?? 'success'} onClose={clearToast}>{toast?.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default BudgetDetailPage;
