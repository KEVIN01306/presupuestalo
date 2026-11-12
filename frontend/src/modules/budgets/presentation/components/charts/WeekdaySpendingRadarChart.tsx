import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAuthStore } from '../../../../../core/store/authStore';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import type { WeekdaySpendingItem } from '../../../domain/interfaces/budget.interface';
import './chartSetup';

interface WeekdaySpendingRadarChartProps {
    data: WeekdaySpendingItem[];
}

export const WeekdaySpendingRadarChart: React.FC<WeekdaySpendingRadarChartProps> = ({ data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    const hasData = data.some((item) => item.totalSpent > 0);

    const chartData = useMemo(
        () => ({
            labels: data.map((d) => d.day),
            datasets: [
                {
                    label: 'Gasto acumulado',
                    data: data.map((d) => d.totalSpent),
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.16)',
                    borderWidth: 2,
                    pointBackgroundColor: '#1a73e8',
                    pointBorderColor: '#ffffff',
                    pointRadius: isMobile ? 3 : 4,
                },
            ],
        }),
        [data, isMobile],
    );

    const options = useMemo<ChartOptions<'radar'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatCurrency(Number(ctx.parsed.r ?? 0), symbol),
                    },
                },
            },
            scales: {
                r: {
                    beginAtZero: true,
                    grid: { color: '#dadce0' },
                    angleLines: { color: '#dadce0' },
                    pointLabels: { color: '#3c4043', font: { size: isMobile ? 11 : 12, weight: 500 } },
                    ticks: {
                        color: '#5f6368',
                        backdropColor: 'transparent',
                        maxTicksLimit: isMobile ? 4 : undefined,
                        font: { size: isMobile ? 10 : 11 },
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
                    Gastos por día de la semana
                </Typography>
                <Typography variant="body2" sx={{ color: '#5f6368', mb: 2 }}>
                    Distribución semanal para identificar días de mayor consumo
                </Typography>
                {!hasData ? (
                    <Box sx={{ height: { xs: 250, sm: 290 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa', borderRadius: '16px', px: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#5f6368' }}>
                            Sin gastos suficientes para mostrar la telaraña semanal.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ position: 'relative', width: '100%', minWidth: 0, overflow: 'hidden', height: { xs: 250, sm: 290 } }}>
                        <Radar data={chartData} options={options} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
