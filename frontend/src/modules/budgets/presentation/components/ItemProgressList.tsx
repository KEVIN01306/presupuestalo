import React from 'react';
import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { BudgetItemProgress } from '../../domain/interfaces/budget.interface';

interface ItemProgressListProps {
    items: BudgetItemProgress[];
}

export const ItemProgressList: React.FC<ItemProgressListProps> = ({ items }) => {
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500, mb: 2 }}>
                    Progreso por rubro
                </Typography>
                {items.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#5f6368' }}>
                        Aún no hay rubros proyectados en este presupuesto.
                    </Typography>
                ) : (
                    <Stack sx={{ gap: 2.5 }}>
                        {items.map((item) => {
                            const pct = Math.min(100, Math.max(0, item.progressPercent));
                            return (
                                <Box key={item.id} sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8f9fa' }}>
                                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                                        <Typography variant="body2" sx={{ color: '#202124', fontWeight: 500 }}>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#5f6368' }}>
                                            {formatCurrency(item.totalSpent, symbol)} / {formatCurrency(item.projectedAmount, symbol)} ({pct.toFixed(0)}%)
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={pct}
                                        color={pct >= 100 ? 'error' : 'primary'}
                                        sx={{ height: 8, borderRadius: 4, bgcolor: '#e8eaed' }}
                                    />
                                    {item.hasUserSplit && item.allocations.length > 0 && (
                                        <Stack sx={{ gap: 1, mt: 1.5, pl: 1.5, borderLeft: '2px solid #dadce0' }}>
                                            {item.allocations.map((alloc) => {
                                                const allocPct = Math.min(100, Math.max(0, alloc.progressPercent));
                                                return (
                                                    <Box key={alloc.userId}>
                                                        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" sx={{ color: '#3c4043' }}>
                                                                {alloc.firstName} {alloc.lastName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#5f6368' }}>
                                                                {formatCurrency(alloc.paidAmount, symbol)} / {formatCurrency(alloc.assignedAmount, symbol)}
                                                            </Typography>
                                                        </Stack>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={allocPct}
                                                            sx={{ height: 5, borderRadius: 4, bgcolor: '#e8eaed', mt: 0.25 }}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    )}
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};
