import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { PersonAddOutlined, PersonRemoveOutlined } from '@mui/icons-material';
import { formatDate } from '../../../../core/utils/formatDate';
import type { TeamMemberDetail, TeamRole } from '../../domain/interfaces/team.interface';

interface TeamMembersCardProps {
    members: TeamMemberDetail[];
    teamOwnerId: string;
    userRole: TeamRole;
    isPersonal: boolean;
    onInvite: () => void;
    onChangeRole: (memberId: string, role: TeamRole) => void;
    onExpel: (member: TeamMemberDetail) => void;
}

const ROLE_LABELS: Record<TeamRole, string> = {
    OWNER: 'Propietario',
    EDITOR: 'Editor',
    VIEWER: 'Lector',
};

export const TeamMembersCard: React.FC<TeamMembersCardProps> = ({
    members,
    teamOwnerId,
    userRole,
    isPersonal,
    onInvite,
    onChangeRole,
    onExpel,
}) => {
    const isOwner = userRole === 'OWNER';

    return (
        <Paper sx={{ borderRadius: '24px', border: '1px solid #dadce0', overflow: 'hidden' }}>
            <Box
                sx={{
                    p: 3,
                    borderBottom: '1px solid #dadce0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography variant="h6">Miembros ({members.length})</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Gestiona los integrantes y sus permisos en este equipo
                    </Typography>
                </Box>
                {isOwner && !isPersonal && (
                    <Button size="small" variant="contained" startIcon={<PersonAddOutlined />} onClick={onInvite}>
                        Invitar miembro
                    </Button>
                )}
            </Box>

            {members.map((member, idx) => {
                const isTeamOwner = member.userId === teamOwnerId;
                const fullName = `${member.user.firstName} ${member.user.lastName}`.trim();
                const initials = `${member.user.firstName?.[0] ?? ''}${member.user.lastName?.[0] ?? ''}`.toUpperCase();

                return (
                    <Box
                        key={member.id}
                        sx={{
                            px: 3,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: 'wrap',
                            borderBottom: idx === members.length - 1 ? 'none' : '1px solid #dadce0',
                        }}
                    >
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={member.user.avatarUrl ?? undefined} sx={{ width: 36, height: 36, fontSize: 13 }}>
                                {initials}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2">{fullName}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    {member.user.email} · Unido el {formatDate(member.joinedAt, 'es-ES')}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                            {isOwner && !isTeamOwner ? (
                                <Select
                                    size="small"
                                    value={member.role}
                                    onChange={(e) => onChangeRole(member.id, e.target.value as TeamRole)}
                                    sx={{ minWidth: 130, borderRadius: '8px' }}
                                >
                                    <MenuItem value="OWNER">Propietario</MenuItem>
                                    <MenuItem value="EDITOR">Editor</MenuItem>
                                    <MenuItem value="VIEWER">Lector</MenuItem>
                                </Select>
                            ) : (
                                <Chip
                                    label={ROLE_LABELS[member.role]}
                                    size="small"
                                    color={member.role === 'OWNER' ? 'primary' : 'default'}
                                />
                            )}

                            {isOwner && (
                                <Tooltip title={isTeamOwner ? 'No se puede expulsar al propietario' : 'Expulsar miembro'}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            disabled={isTeamOwner}
                                            onClick={() => onExpel(member)}
                                        >
                                            <PersonRemoveOutlined fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Stack>
                    </Box>
                );
            })}
        </Paper>
    );
};
