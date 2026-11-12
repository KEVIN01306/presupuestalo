import React from 'react';
import { Chip } from '@mui/material';
import type { BudgetStatus } from '../../domain/interfaces/budget.interface';

interface BudgetStatusChipProps {
    status: BudgetStatus;
}

export const BudgetStatusChip: React.FC<BudgetStatusChipProps> = ({ status }) => {
    const isActive = status === 'ACTIVE';
    return (
        <Chip
            size="small"
            label={isActive ? 'Activo' : 'Cerrado'}
            sx={{
                borderRadius: '9999px',
                fontWeight: 500,
                fontSize: '12px',
                bgcolor: isActive ? '#e6f4ea' : '#f1f3f4',
                color: isActive ? '#188038' : '#5f6368',
                border: `1px solid ${isActive ? '#ceead6' : '#dadce0'}`,
            }}
        />
    );
};
