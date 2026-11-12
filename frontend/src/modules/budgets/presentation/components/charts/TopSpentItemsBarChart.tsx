import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAuthStore } from '../../../../../core/store/authStore';
import { formatCurrency } from '../../../../../shared/utils/formatCurrency';
import type { TopSpentItem } from '../../../domain/interfaces/budget.interface';
import { CHART_COLORS } from './chartSetup';

interface TopSpentItemsBarChartProps {
    data: TopSpentItem[];
}

const truncateLabel = (name: string, isMobile: boolean): string =>
    isMobile && name.length > 14 ? `${name.slice(0, 14)}...` : name;

export const TopSpentItemsBarChart: React.FC<TopSpentItemsBarChartProps> = ({ data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    const hasData = data.length > 0 && data.some((item) => item.totalSpent > 0);
    const mobileHeight = Math.max(220, data.length * 42);

    const chartData = useMemo(
        () => ({
            labels: data.map((item) => truncateLabel(item.name, isMobile)),
            datasets: [
                {
                    label: 'Gastado',
                    data: data.map((item) => item.totalSpent),
                    backgroundColor: data.map((_, idx) => CHART_COLORS[idx % CHART_COLORS.length]),
                    borderRadius: 8,
                    barThickness: isMobile ? 16 : 20,
                },
            ],
        }),
        [data, isMobile],
    );

    const options = useMemo<ChartOptions<'bar'>>(
        () => ({
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => data[items[0]?.dataIndex ?? 0]?.name ?? '',
                        label: (ctx) => {
                            const item = data[ctx.dataIndex];
                            const spent = formatCurrency(Number(ctx.parsed.x ?? 0), symbol);
                            const projected = item ? formatCurrency(item.projectedAmount, symbol) : '';
                            return projected ? `${spent} / ${projected}` : spent;
                        },
                    },
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: '#dadce0' },
                    ticks: {
                        color: '#5f6368',
                        maxTicksLimit: isMobile ? 4 : 6,
                        font: { size: isMobile ? 10 : 12 },
                        callback: (value) => `${symbol} ${value}`,
                    },
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#202124', font: { size: isMobile ? 11 : 12 } },
                },
            },
        }),
        [data, symbol, isMobile],
    );

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff', height: '100%', minWidth: 0, width: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500, mb: 0.5 }}>
                    Top rubros con mayor gasto
                </Typography>
                <Typography variant="body2" sx={{ color: '#5f6368', mb: 2 }}>
                    Comparativa de los rubros con mayor ejecución acumulada
                </Typography>
                {!hasData ? (
                    <Box sx={{ height: { xs: 220, sm: 290 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa', borderRadius: '16px', px: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#5f6368' }}>
                            Aún no hay rubros con gastos registrados.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ position: 'relative', width: '100%', minWidth: 0, overflow: 'hidden', height: { xs: mobileHeight, sm: 290 } }}>
                        <Bar data={chartData} options={options} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
