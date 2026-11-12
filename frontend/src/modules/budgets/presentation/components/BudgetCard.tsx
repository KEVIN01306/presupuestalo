import React from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { ArrowForwardOutlined, CalendarTodayOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatDate } from '../../../../core/utils/formatDate';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { BudgetSummary } from '../../domain/interfaces/budget.interface';
import { BudgetStatusChip } from './BudgetStatusChip';

interface BudgetCardProps {
    budget: BudgetSummary;
    onOpen: (budgetId: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onOpen }) => {
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    return (
        <Card
            sx={{
                borderRadius: '24px',
                border: '1px solid #dadce0',
                boxShadow: 'none',
                bgcolor: '#ffffff',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: '#1a73e8' },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <Box>
                        <Typography variant="h6" sx={{ color: '#202124', fontWeight: 500, fontSize: '18px' }}>
                            {budget.name}
                        </Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                            <CalendarTodayOutlined sx={{ fontSize: 14, color: '#5f6368' }} />
                            <Typography variant="caption" sx={{ color: '#5f6368' }}>
                                {formatDate(budget.startDate)} — {formatDate(budget.endDate)}
                            </Typography>
                        </Stack>
                    </Box>
                    <BudgetStatusChip status={budget.status} />
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 1.5,
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: '#f8f9fa',
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block' }}>
                            Ingresos
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#188038', fontWeight: 500 }}>
                            {formatCurrency(budget.totalIncome, symbol)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block' }}>
                            Proyectado
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#202124', fontWeight: 500 }}>
                            {formatCurrency(budget.totalProjected, symbol)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block' }}>
                            Gastado
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1a73e8', fontWeight: 500 }}>
                            {formatCurrency(budget.totalSpent, symbol)}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<ArrowForwardOutlined />}
                    onClick={() => onOpen(budget.id)}
                    sx={{
                        borderRadius: '200px',
                        borderColor: '#dadce0',
                        color: '#1a73e8',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { borderColor: '#1a73e8', bgcolor: '#f8f9fa' },
                    }}
                >
                    Abrir presupuesto
                </Button>
            </CardContent>
        </Card>
    );
};
