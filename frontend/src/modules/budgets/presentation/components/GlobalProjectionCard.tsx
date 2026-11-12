import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { BudgetDashboardGlobal } from '../../domain/interfaces/budget.interface';

interface GlobalProjectionCardProps {
    global: BudgetDashboardGlobal;
}

export const GlobalProjectionCard: React.FC<GlobalProjectionCardProps> = ({ global }) => {
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    const metrics = [
        { label: 'Ingresos totales', value: global.totalIncome, color: '#188038' },
        { label: 'Total proyectado', value: global.totalProjected, color: '#202124' },
        { label: 'Sobrante proyectado', value: global.projectedRemainder, color: '#5f6368' },
        { label: 'Total gastado', value: global.totalSpent, color: '#1a73e8' },
        { label: 'Sobrante real', value: global.realRemainder, color: '#188038' },
    ];

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500, mb: 2 }}>
                    Proyección global del presupuesto
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' },
                        gap: 2,
                    }}
                >
                    {metrics.map((m) => (
                        <Box key={m.label} sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8f9fa' }}>
                            <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', mb: 0.5 }}>
                                {m.label}
                            </Typography>
                            <Typography variant="h6" sx={{ color: m.color, fontWeight: 500, fontSize: '18px' }}>
                                {formatCurrency(m.value, symbol)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};
