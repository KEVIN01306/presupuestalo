import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Card, CardContent, CircularProgress, Snackbar, Typography } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import { BudgetCard } from '../components/BudgetCard';
import { CarryoverModal } from '../components/CarryoverModal';
import { CreateBudgetDialog } from '../components/CreateBudgetDialog';
import { useBudgetsList } from '../hooks/useBudgetsList';

export const BudgetsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [createOpen, setCreateOpen] = useState(false);
    const {
        activeTeamId,
        activeTeam,
        canEdit,
        budgets,
        pendingCarryover,
        carryoverModalOpen,
        applyingCarryover,
        loading,
        toast,
        clearToast,
        closeCarryoverModal,
        handleCreateBudget,
        handleApplyCarryover,
    } = useBudgetsList();

    return (
        <Box>
            <PageHeader
                title="Presupuestos"
                subtitle={
                    activeTeam
                        ? `Equipo activo: ${activeTeam.name}${activeTeam.currency ? ` · ${activeTeam.currency.code} (${activeTeam.currency.symbol})` : ''}`
                        : 'Gestiona tus presupuestos mensuales o personalizados'
                }
                actionLabel={canEdit && activeTeamId ? 'Nuevo presupuesto' : undefined}
                actionIcon={<AddOutlined />}
                onAction={canEdit && activeTeamId ? () => setCreateOpen(true) : undefined}
            />

            {!activeTeamId ? (
                <Alert severity="info">Selecciona o crea un equipo para gestionar sus presupuestos.</Alert>
            ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : budgets.length === 0 ? (
                <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#202124', mb: 1 }}>Sin presupuestos aún</Typography>
                        <Typography variant="body2" sx={{ color: '#5f6368' }}>
                            Crea tu primer presupuesto para registrar ingresos, rubros proyectados y gastos reales.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                    {budgets.map((budget) => (
                        <BudgetCard key={budget.id} budget={budget} onOpen={(id) => navigate(`/budgets/${id}`)} />
                    ))}
                </Box>
            )}

            <CreateBudgetDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmitValues={handleCreateBudget} />
            <CarryoverModal
                open={carryoverModalOpen}
                carryover={pendingCarryover}
                loading={applyingCarryover}
                onClose={closeCarryoverModal}
                onAccept={handleApplyCarryover}
            />
            <Snackbar open={!!toast} autoHideDuration={4000} onClose={clearToast}>
                <Alert severity={toast?.severity ?? 'success'} onClose={clearToast}>{toast?.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default BudgetsListPage;
