import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { Check, Close, ContentCopy, Schedule } from '@mui/icons-material';
import type { AuditLogItem } from '../../domain/audit.entity';
import { formatDateTime } from '../../../../core/utils/formatDate';
import { AuditActionChip, getResourceIcon } from './auditUiHelpers';

interface AuditLogDetailDialogProps {
    open: boolean;
    onClose: () => void;
    log: AuditLogItem | null;
}

export const AuditLogDetailDialog: React.FC<AuditLogDetailDialogProps> = ({
    open,
    onClose,
    log,
}) => {
    const [copied, setCopied] = useState(false);
    if (!log) return null;

    const fullName = log.user
        ? `${log.user.firstName} ${log.user.lastName}`.trim()
        : 'Sistema / Anónimo';
    const initials = log.user
        ? `${log.user.firstName?.[0] ?? ''}${log.user.lastName?.[0] ?? ''}`.toUpperCase()
        : 'S';

    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(log, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #dadce0' }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                    <AuditActionChip action={log.action} />
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                        {getResourceIcon(log.resource)}
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {log.resource.toUpperCase()}
                        </Typography>
                    </Stack>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2.5 }}>
                <Stack sx={{ gap: 2 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                            <Avatar src={log.user?.avatarUrl ?? undefined} sx={{ width: 36, height: 36, fontSize: 13 }}>
                                {initials}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2">{fullName}</Typography>
                                {log.user?.email && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {log.user.email}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <Schedule fontSize="small" />
                            <Typography variant="caption">{formatDateTime(log.createdAt, 'es-ES')}</Typography>
                        </Stack>
                    </Stack>

                    {log.resourceId && (
                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                ID del Recurso
                            </Typography>
                            <Chip label={log.resourceId} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                        </Box>
                    )}

                    <Divider />

                    <Box>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">Detalles del evento</Typography>
                            <Tooltip title="Copiar JSON completo">
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={copied ? <Check /> : <ContentCopy />}
                                    onClick={handleCopyJson}
                                >
                                    {copied ? 'Copiado' : 'Copiar JSON'}
                                </Button>
                            </Tooltip>
                        </Stack>
                        <Paper
                            sx={{
                                p: 2,
                                borderRadius: '12px',
                                border: '1px solid #dadce0',
                                bgcolor: '#f8f9fa',
                                maxHeight: 260,
                                overflow: 'auto',
                            }}
                        >
                            <Typography
                                component="pre"
                                variant="caption"
                                sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', m: 0 }}
                            >
                                {log.details ? JSON.stringify(log.details, null, 2) : 'Sin detalles adicionales.'}
                            </Typography>
                        </Paper>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button variant="outlined" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};
