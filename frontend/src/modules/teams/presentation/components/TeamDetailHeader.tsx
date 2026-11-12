import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { DeleteOutlined, EditOutlined, GroupsOutlined, PersonOutlined } from '@mui/icons-material';
import type { TeamDetail, TeamRole } from '../../domain/interfaces/team.interface';

interface TeamDetailHeaderProps {
    team: TeamDetail;
    userRole: TeamRole;
    onEdit: () => void;
    onDelete: () => void;
}

const ROLE_LABELS: Record<TeamRole, string> = {
    OWNER: 'Propietario',
    EDITOR: 'Editor',
    VIEWER: 'Lector',
};

export const TeamDetailHeader: React.FC<TeamDetailHeaderProps> = ({
    team,
    userRole,
    onEdit,
    onDelete,
}) => {
    const isOwner = userRole === 'OWNER';

    return (
        <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid #dadce0' }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}
            >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            bgcolor: '#e8f0fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {team.isPersonal ? <PersonOutlined color="primary" /> : <GroupsOutlined color="primary" />}
                    </Box>
                    <Box>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h6">{team.name}</Typography>
                            {team.isPersonal && <Chip label="Personal" size="small" variant="outlined" />}
                            {team.currency && (
                                <Chip label={`${team.currency.code} (${team.currency.symbol})`} size="small" variant="outlined" />
                            )}
                            <Chip
                                label={ROLE_LABELS[userRole]}
                                size="small"
                                color={isOwner ? 'primary' : 'default'}
                            />
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {team.description || 'Sin descripción'}
                        </Typography>
                    </Box>
                </Stack>

                {isOwner && (
                    <Stack direction="row" sx={{ gap: 1 }}>
                        <Button size="small" variant="outlined" startIcon={<EditOutlined />} onClick={onEdit}>
                            Editar
                        </Button>
                        {!team.isPersonal && (
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteOutlined />}
                                onClick={onDelete}
                            >
                                Eliminar
                            </Button>
                        )}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
};
