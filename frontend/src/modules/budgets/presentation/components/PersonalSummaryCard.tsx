import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { BudgetUserSegmentation } from '../../domain/interfaces/budget.interface';

interface PersonalSummaryCardProps {
    summary: BudgetUserSegmentation | null;
}

export const PersonalSummaryCard: React.FC<PersonalSummaryCardProps> = ({ summary }) => {
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    if (!summary) return null;

    const metrics = [
        { label: 'Te toca pagar', value: summary.assignedToPay, color: '#202124' },
        { label: 'Pagado', value: summary.totalPaid, color: '#1a73e8' },
        { label: 'Te falta por pagar', value: summary.remainingToPay, color: '#d93025' },
        { label: 'Sobrante proyectado', value: summary.projectedRemainder, color: '#5f6368' },
        { label: 'Sobrante real', value: summary.realRemainder, color: '#188038' },
    ];

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500, mb: 2 }}>
                    Tu resumen personal ({summary.firstName} {summary.lastName})
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
