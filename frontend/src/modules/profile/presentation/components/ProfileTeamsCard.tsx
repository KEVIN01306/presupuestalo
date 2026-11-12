import React from 'react';
import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import { GroupsOutlined, PersonOutlined } from '@mui/icons-material';
import type { AuthTeamMembership } from '../../../auth/domain/interfaces/auth.interfaces';

interface ProfileTeamsCardProps {
    memberships: AuthTeamMembership[];
    activeTeamId: string | null;
}

const ROLE_LABELS: Record<string, string> = {
    OWNER: 'Propietario',
    EDITOR: 'Editor',
    VIEWER: 'Lector',
};

export const ProfileTeamsCard: React.FC<ProfileTeamsCardProps> = ({
    memberships,
    activeTeamId,
}) => (
    <Paper sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Mis equipos y espacios</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Espacios personales y colaborativos a los que perteneces
            </Typography>
        </Box>
        {memberships.length === 0 ? (
            <Box sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No perteneces a ningún equipo todavía.
                </Typography>
            </Box>
        ) : (
            memberships.map((m, idx) => (
                <Box
                    key={m.teamId}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 3,
                        py: 2,
                        borderBottom: idx === memberships.length - 1 ? 'none' : '1px solid',
                        borderColor: 'divider',
                        bgcolor: m.teamId === activeTeamId ? '#e8f0fe' : 'transparent',
                    }}
                >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                        {m.team.isPersonal ? (
                            <PersonOutlined fontSize="small" color="primary" />
                        ) : (
                            <GroupsOutlined fontSize="small" color="action" />
                        )}
                        <Box>
                            <Typography variant="subtitle2">{m.team.name}</Typography>
                            {m.team.description && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {m.team.description}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <Stack direction="row" sx={{ gap: 1 }}>
                        {m.team.isPersonal && <Chip label="Personal" size="small" variant="outlined" />}
                        <Chip
                            label={ROLE_LABELS[m.role] ?? m.role}
                            size="small"
                            color={m.role === 'OWNER' ? 'primary' : 'default'}
                        />
                    </Stack>
                </Box>
            ))
        )}
    </Paper>
);
