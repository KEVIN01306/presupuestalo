import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, Chip } from '@mui/material';
import {
    PersonOutlineOutlined,
    EmailOutlined,
    FingerprintOutlined,
    CalendarMonthOutlined,
    ContentCopyOutlined,
    Check,
} from '@mui/icons-material';
import type { AuthUser } from '../../../auth/domain/interfaces/auth.interfaces';

interface ProfileDetailsCardProps {
    profile: AuthUser | null;
}

export const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({ profile }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyId = () => {
        if (!profile?.id) return;
        navigator.clipboard.writeText(profile.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const rows = [
        {
            icon: <PersonOutlineOutlined fontSize="small" />,
            label: 'Nombre completo',
            value: profile ? `${profile.firstName} ${profile.lastName}` : '-',
        },
        {
            icon: <EmailOutlined fontSize="small" />,
            label: 'Correo electrónico',
            value: profile?.email || '-',
        },
        {
            icon: <FingerprintOutlined fontSize="small" />,
            label: 'ID de usuario',
            value: profile?.id ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {profile.id}
                    </Typography>
                    <Tooltip title={copied ? 'Copiado' : 'Copiar ID'}>
                        <IconButton size="small" onClick={handleCopyId}>
                            {copied ? <Check fontSize="small" color="success" /> : <ContentCopyOutlined fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : '-',
        },
        {
            icon: <CalendarMonthOutlined fontSize="small" />,
            label: 'Estado de cuenta',
            value: (
                <Chip
                    label={profile?.isActive ? 'Activa' : 'Inactiva'}
                    size="small"
                    color={profile?.isActive ? 'success' : 'default'}
                />
            ),
        },
    ];

    return (
        <Paper sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6">Información personal</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Datos básicos de tu cuenta en Presupuesto
                </Typography>
            </Box>
            {rows.map((row, idx) => (
                <Box
                    key={row.label}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        px: 3,
                        py: 2,
                        gap: 1,
                        borderBottom: idx === rows.length - 1 ? 'none' : '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                        {row.icon}
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {row.label}
                        </Typography>
                    </Box>
                    <Box sx={{ color: 'text.primary' }}>{row.value}</Box>
                </Box>
            ))}
        </Paper>
    );
};
