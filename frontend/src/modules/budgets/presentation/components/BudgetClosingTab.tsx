import React, { useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatDateTime } from '../../../../core/utils/formatDate';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { BudgetDashboardSummary } from '../../domain/interfaces/budget.interface';
import type { CloseBudgetFormValues } from '../../domain/schemas/budget.schema';

interface BudgetClosingTabProps {
    summary: BudgetDashboardSummary;
    canEdit: boolean;
    onCloseBudget: (values: CloseBudgetFormValues) => Promise<void>;
}

export const BudgetClosingTab: React.FC<BudgetClosingTabProps> = ({ summary, canEdit, onCloseBudget }) => {
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    const isClosed = summary.budget.status === 'CLOSED';
    const maxSavings = Math.max(0, summary.global.realRemainder);
    const [savedAmount, setSavedAmount] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const carriedOverPreview = Math.max(0, maxSavings - Math.max(0, savedAmount || 0));

    const handleCloseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (savedAmount < 0 || savedAmount > maxSavings) {
            setError(`El ahorro debe estar entre 0 y ${formatCurrency(maxSavings, symbol)}.`);
            return;
        }
        setSubmitting(true);
        try {
            await onCloseBudget({ savedAmount });
        } catch (err) {
            const msg = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined;
            setError(msg || 'No se pudo cerrar el presupuesto.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isClosed && summary.closing) {
        const c = summary.closing;
        return (
            <Stack sx={{ gap: 3 }}>
                <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>Cierre de presupuesto</Typography>
                        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', mb: 2 }}>
                            Cerrado el {formatDateTime(c.closedAt)}
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(5, 1fr)' }, gap: 2 }}>
                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8f9fa' }}><Typography variant="caption" color="text.secondary">Ingresos</Typography><Typography variant="h6" sx={{ fontSize: 18 }}>{formatCurrency(c.totalIncome, symbol)}</Typography></Box>
                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8f9fa' }}><Typography variant="caption" color="text.secondary">Gastado</Typography><Typography variant="h6" sx={{ fontSize: 18 }}>{formatCurrency(c.totalSpent, symbol)}</Typography></Box>
                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8f9fa' }}><Typography variant="caption" color="text.secondary">Sobrante</Typography><Typography variant="h6" sx={{ fontSize: 18 }}>{formatCurrency(c.totalRemainder, symbol)}</Typography></Box>
                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#e6f4ea' }}><Typography variant="caption" color="#188038">Ahorro</Typography><Typography variant="h6" sx={{ fontSize: 18 }} color="#188038">{formatCurrency(c.savedAmount, symbol)}</Typography></Box>
                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#e8f0fe' }}><Typography variant="caption" color="#1a73e8">Carryover</Typography><Typography variant="h6" sx={{ fontSize: 18 }} color="#1a73e8">{formatCurrency(c.carriedOverAmount, symbol)}</Typography></Box>
                        </Box>
                    </CardContent>
                </Card>
                <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>Sobrante por miembro</Typography>
                        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Miembro</TableCell><TableCell align="right">Aportado</TableCell><TableCell align="right">Gastado</TableCell><TableCell align="right">Sobrante</TableCell></TableRow></TableHead><TableBody>
                            {c.userRemainders.map((u) => (
                                <TableRow key={u.id}><TableCell>{u.firstName} {u.lastName}</TableCell><TableCell align="right">{formatCurrency(u.contributedIncome, symbol)}</TableCell><TableCell align="right">{formatCurrency(u.totalSpent, symbol)}</TableCell><TableCell align="right" sx={{ fontWeight: 500 }}>{formatCurrency(u.remainderAmount, symbol)}</TableCell></TableRow>
                            ))}
                        </TableBody></Table></TableContainer>
                    </CardContent>
                </Card>
            </Stack>
        );
    }

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>Cierre y ahorro</Typography>
                <Typography variant="body2" sx={{ color: '#5f6368', mb: 2.5 }}>
                    Ingresos: <strong>{formatCurrency(summary.global.totalIncome, symbol)}</strong> · Gastado: <strong>{formatCurrency(summary.global.totalSpent, symbol)}</strong> · Sobrante real: <strong>{formatCurrency(summary.global.realRemainder, symbol)}</strong>
                </Typography>
                {!canEdit ? (
                    <Alert severity="info">Solo un propietario o editor puede cerrar este presupuesto.</Alert>
                ) : (
                    <form onSubmit={handleCloseSubmit}>
                        <Stack sx={{ gap: 2, maxWidth: 420 }}>
                            {error && <Alert severity="error">{error}</Alert>}
                            <TextField
                                label="Monto destinado a ahorro"
                                type="number"
                                value={savedAmount}
                                onChange={(e) => setSavedAmount(Number(e.target.value))}
                                helperText={`Máximo disponible: ${formatCurrency(maxSavings, symbol)}`}
                                fullWidth
                            />
                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8f9fa' }}>
                                <Typography variant="caption" color="text.secondary">Sobrante para el siguiente presupuesto (Carryover):</Typography>
                                <Typography variant="h6" sx={{ color: '#1a73e8', fontWeight: 500 }}>{formatCurrency(carriedOverPreview, symbol)}</Typography>
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <LockOutlined />}
                                sx={{ borderRadius: '200px', textTransform: 'none', alignSelf: 'flex-start', px: 3 }}
                            >
                                Cerrar Presupuesto
                            </Button>
                        </Stack>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};
