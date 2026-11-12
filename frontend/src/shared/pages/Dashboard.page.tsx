import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { AddOutlined, ArrowForwardOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../core/store/authStore';
import type { BudgetDashboardSummary } from '../../modules/budgets/domain/interfaces/budget.interface';
import { BudgetRepository } from '../../modules/budgets/infrastructure/repositories/budget.repository';
import { GlobalProjectionCard } from '../../modules/budgets/presentation/components/GlobalProjectionCard';
import { ItemProgressList } from '../../modules/budgets/presentation/components/ItemProgressList';
import { MemberSegmentationTable } from '../../modules/budgets/presentation/components/MemberSegmentationTable';
import { PersonalSummaryCard } from '../../modules/budgets/presentation/components/PersonalSummaryCard';
import { DashboardChartsSection } from '../../modules/budgets/presentation/components/charts/DashboardChartsSection';
import { PageHeader } from '../components/common/PageHeader';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeTeamId, activeTeam } = useAuthStore();
    const [summary, setSummary] = useState<BudgetDashboardSummary | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            await Promise.resolve();
            if (cancelled) return;
            if (!activeTeamId) {
                setSummary(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const list = await BudgetRepository.listarPorEquipo(activeTeamId);
                const active = list.find((b) => b.status === 'ACTIVE') ?? list[0];
                const res = active ? await BudgetRepository.obtenerResumen(active.id) : null;
                if (!cancelled) setSummary(res);
            } catch {
                if (!cancelled) setSummary(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [activeTeamId]);

    return (
        <Box>
            <PageHeader
                title="Dashboard"
                subtitle={
                    activeTeam
                        ? `Resumen de ${activeTeam.name}${activeTeam.currency ? ` · ${activeTeam.currency.code} (${activeTeam.currency.symbol})` : ''}`
                        : 'Resumen de tus presupuestos'
                }
            >
                <Button
                    variant="outlined"
                    endIcon={<ArrowForwardOutlined />}
                    onClick={() => navigate(summary ? `/budgets/${summary.budget.id}` : '/budgets')}
                    sx={{ borderRadius: '200px', textTransform: 'none' }}
                >
                    {summary ? 'Abrir presupuesto' : 'Ir a presupuestos'}
                </Button>
            </PageHeader>

            {!activeTeamId ? (
                <Alert severity="info">Selecciona o crea un equipo para ver tu resumen financiero.</Alert>
            ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : !summary ? (
                <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#202124', fontWeight: 500, mb: 1 }}>
                            No tienes presupuestos activos
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#5f6368', mb: 2.5 }}>
                            Crea tu primer presupuesto para comenzar a registrar ingresos, rubros y gastos.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddOutlined />}
                            onClick={() => navigate('/budgets')}
                            sx={{ borderRadius: '200px', textTransform: 'none', px: 3 }}
                        >
                            Crear presupuesto
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Stack sx={{ gap: 3 }}>
                    <PersonalSummaryCard summary={summary.currentUserSummary} />
                    <GlobalProjectionCard global={summary.global} />
                    <DashboardChartsSection analytics={summary.analytics} />
                    <MemberSegmentationTable rows={summary.userSegmentation} />
                    <ItemProgressList items={summary.itemsProgress} />
                </Stack>
            )}
        </Box>
    );
};

export default DashboardPage;
