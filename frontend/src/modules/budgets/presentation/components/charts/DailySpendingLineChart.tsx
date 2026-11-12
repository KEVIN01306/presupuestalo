import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAuthStore } from '../../../../../core/store/authStore';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import type { DailySpendingByMember } from '../../../domain/interfaces/budget.interface';
import { CHART_COLORS } from './chartSetup';

interface DailySpendingLineChartProps {
    data: DailySpendingByMember;
}

const formatShortDate = (isoDate: string, isMobile: boolean): string => {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return isMobile ? `${parts[1]}-${parts[2]}` : `${parts[2]}/${parts[1]}`;
};

export const DailySpendingLineChart: React.FC<DailySpendingLineChartProps> = ({ data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    const hasData = data.dates.length > 0 && data.series.some((s) => s.data.some((v) => v > 0));

    const chartData = useMemo(
        () => ({
            labels: data.dates.map((d) => formatShortDate(d, isMobile)),
            datasets: data.series.map((member, index) => {
                const color = CHART_COLORS[index % CHART_COLORS.length];
                return {
                    label: member.name,
                    data: member.data,
                    borderColor: color,
                    backgroundColor: color,
                    borderWidth: 2,
                    pointRadius: isMobile ? 2 : 3,
                    pointHoverRadius: 5,
                    tension: 0.3,
                    fill: false,
                };
            }),
        }),
        [data, isMobile],
    );

    const options = useMemo<ChartOptions<'line'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: isMobile ? 10 : 8,
                        font: { size: isMobile ? 11 : 12 },
                        color: '#3c4043',
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(Number(ctx.parsed.y ?? 0), symbol)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#5f6368',
                        autoSkip: true,
                        maxTicksLimit: isMobile ? 5 : undefined,
                        maxRotation: isMobile ? 45 : 0,
                        font: { size: isMobile ? 10 : 12 },
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#dadce0' },
                    ticks: {
                        color: '#5f6368',
                        maxTicksLimit: isMobile ? 5 : undefined,
                        font: { size: isMobile ? 10 : 12 },
                        callback: (value) => `${symbol} ${value}`,
                    },
                },
            },
        }),
        [symbol, isMobile],
    );

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff', height: '100%', minWidth: 0, width: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500, mb: 0.5 }}>
                    Gasto diario por miembro
                </Typography>
                <Typography variant="body2" sx={{ color: '#5f6368', mb: 2 }}>
                    Evolución diaria de gastos registrados por cada integrante
                </Typography>
                {!hasData ? (
                    <Box sx={{ height: { xs: 240, sm: 290 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa', borderRadius: '16px', px: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#5f6368' }}>
                            Aún no hay gastos diarios registrados en este presupuesto.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ position: 'relative', width: '100%', minWidth: 0, overflow: 'hidden', height: { xs: 240, sm: 290 } }}>
                        <Line data={chartData} options={options} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
