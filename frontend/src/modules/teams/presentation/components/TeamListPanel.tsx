import React from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import {
    CheckCircleOutlined,
    GroupsOutlined,
    PersonOutlined,
    SwapHorizOutlined,
} from '@mui/icons-material';
import type { TeamSummary } from '../../domain/interfaces/team.interface';

interface TeamListPanelProps {
    teams: TeamSummary[];
    selectedTeamId: string | null;
    activeTeamId: string | null;
    loading: boolean;
    onSelect: (teamId: string) => void;
    onSwitchTeam: (teamId: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
    OWNER: 'Propietario',
    EDITOR: 'Editor',
    VIEWER: 'Lector',
};

export const TeamListPanel: React.FC<TeamListPanelProps> = ({
    teams,
    selectedTeamId,
    activeTeamId,
    loading,
    onSelect,
    onSwitchTeam,
}) => (
    <Paper sx={{ borderRadius: '24px', border: '1px solid #dadce0', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #dadce0' }}>
            <Typography variant="h6">Mis equipos</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Selecciona un equipo para administrarlo o cambiar tu espacio activo
            </Typography>
        </Box>
        {loading && teams.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={28} />
            </Box>
        ) : teams.length === 0 ? (
            <Box sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No perteneces a ningún equipo todavía.
                </Typography>
            </Box>
        ) : (
            teams.map((team, idx) => {
                const isSelected = team.id === selectedTeamId;
                const isActive = team.id === activeTeamId;
                return (
                    <Box
                        key={team.id}
                        onClick={() => onSelect(team.id)}
                        sx={{
                            p: 2.5,
                            cursor: 'pointer',
                            borderBottom: idx === teams.length - 1 ? 'none' : '1px solid #dadce0',
                            bgcolor: isSelected ? '#e8f0fe' : 'transparent',
                            transition: 'background-color 0.15s ease',
                            '&:hover': { bgcolor: isSelected ? '#e8f0fe' : '#f8f9fa' },
                        }}
                    >
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                                {team.isPersonal ? (
                                    <PersonOutlined fontSize="small" color="primary" />
                                ) : (
                                    <GroupsOutlined fontSize="small" color="action" />
                                )}
                                <Box>
                                    <Typography variant="subtitle2">{team.name}</Typography>
                                    {team.description && (
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            {team.description}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                            <Chip
                                label={ROLE_LABELS[team.role] ?? team.role}
                                size="small"
                                color={team.role === 'OWNER' ? 'primary' : 'default'}
                            />
                        </Stack>
                        <Stack direction="row" sx={{ mt: 1.5, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                                {team.isPersonal && <Chip label="Personal" size="small" variant="outlined" />}
                                {team.currency && (
                                    <Chip label={`${team.currency.code} (${team.currency.symbol})`} size="small" variant="outlined" />
                                )}
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {team.membersCount} {team.membersCount === 1 ? 'miembro' : 'miembros'}
                                </Typography>
                            </Stack>
                            {isActive ? (
                                <Chip icon={<CheckCircleOutlined />} label="Activo" size="small" color="success" variant="outlined" />
                            ) : (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<SwapHorizOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSwitchTeam(team.id);
                                    }}
                                >
                                    Cambiar a este equipo
                                </Button>
                            )}
                        </Stack>
                    </Box>
                );
            })
        )}
    </Paper>
);
