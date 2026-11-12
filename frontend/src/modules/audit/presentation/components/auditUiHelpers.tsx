import React from 'react';
import { Chip } from '@mui/material';
import {
    AccountBalanceWalletOutlined,
    AttachMoneyOutlined,
    CategoryOutlined,
    GroupsOutlined,
    LockResetOutlined,
    PersonOutlined,
    ReceiptLongOutlined,
    SecurityOutlined,
    StorageOutlined,
} from '@mui/icons-material';
import type { AuditAction } from '../../domain/audit.entity';

export const ACTION_STYLES: Record<AuditAction, { bg: string; color: string; border: string }> = {
    CREATE: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    UPDATE: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    DELETE: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
    LOGIN: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    LOGOUT: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
};

export const AuditActionChip: React.FC<{ action: AuditAction }> = ({ action }) => {
    const style = ACTION_STYLES[action] ?? { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    return (
        <Chip
            label={action}
            size="small"
            sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
            }}
        />
    );
};

export const getResourceIcon = (resource: string): React.ReactNode => {
    switch (resource.toLowerCase()) {
        case 'auth':
            return <SecurityOutlined fontSize="small" sx={{ color: '#6366f1' }} />;
        case 'user':
            return <PersonOutlined fontSize="small" sx={{ color: '#0284c7' }} />;
        case 'team':
        case 'team_member':
            return <GroupsOutlined fontSize="small" sx={{ color: '#1a73e8' }} />;
        case 'income_category':
            return <CategoryOutlined fontSize="small" sx={{ color: '#0d9488' }} />;
        case 'income':
            return <AttachMoneyOutlined fontSize="small" sx={{ color: '#188038' }} />;
        case 'budget':
        case 'budget_item':
            return <AccountBalanceWalletOutlined fontSize="small" sx={{ color: '#7c3aed' }} />;
        case 'expense':
            return <ReceiptLongOutlined fontSize="small" sx={{ color: '#d97706' }} />;
        case 'budget_closing':
            return <LockResetOutlined fontSize="small" sx={{ color: '#059669' }} />;
        default:
            return <StorageOutlined fontSize="small" sx={{ color: '#64748b' }} />;
    }
};
