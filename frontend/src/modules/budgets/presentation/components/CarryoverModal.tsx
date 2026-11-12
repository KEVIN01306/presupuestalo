import React from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import { SavingsOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { PendingCarryoverResponse } from '../../domain/interfaces/budget.interface';

interface CarryoverModalProps {
    open: boolean;
    carryover: PendingCarryoverResponse | null;
    loading: boolean;
    onClose: () => void;
    onAccept: () => Promise<void>;
}

export const CarryoverModal: React.FC<CarryoverModalProps> = ({
    open,
    carryover,
    loading,
    onClose,
    onAccept,
}) => {
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    if (!carryover?.hasPendingCarryover) return null;

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#202124', fontWeight: 500 }}>
                <SavingsOutlined sx={{ color: '#188038' }} />
                Sobrante disponible
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ color: '#3c4043', lineHeight: 1.6 }}>
                    El presupuesto anterior tiene un sobrante de{' '}
                    <strong>{formatCurrency(carryover.carriedOverAmount, symbol)}</strong>. ¿Deseas agregarlo a este nuevo
                    presupuesto?
                </Typography>
                {carryover.sourceBudgetName && (
                    <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', mt: 1 }}>
                        Origen: {carryover.sourceBudgetName}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button variant="text" onClick={onClose} disabled={loading}>
                    Ahora no
                </Button>
                <Button
                    variant="contained"
                    onClick={onAccept}
                    disabled={loading}
                    sx={{ borderRadius: '200px', px: 3, bgcolor: '#188038', '&:hover': { bgcolor: '#146c2e' } }}
                >
                    {loading ? <CircularProgress size={18} color="inherit" /> : 'Agregar sobrante'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
