import React, { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    Typography,
    Chip,
    Box,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    KeyboardArrowDownOutlined,
    PersonOutlined,
    GroupsOutlined,
    CheckOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';

const ROLE_LABELS: Record<string, string> = {
    OWNER: 'Owner',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
};

export const TeamSwitcher: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { teams, activeTeam, activeTeamId, activeRole, switchTeam } = useAuthStore();

    if (!activeTeam || teams.length === 0) {
        return null;
    }

    const handleSelect = (teamId: string) => {
        switchTeam(teamId);
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                id="navbar-team-switcher"
                variant="outlined"
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<KeyboardArrowDownOutlined fontSize="small" />}
                sx={{
                    height: 36,
                    px: 1.75,
                    borderColor: '#dadce0',
                    color: '#202124',
                    bgcolor: '#f8f9fa',
                    gap: 1,
                    '&:hover': { bgcolor: '#e8f0fe', borderColor: '#1a73e8' },
                }}
            >
                {activeTeam.isPersonal ? (
                    <PersonOutlined sx={{ fontSize: 17, color: '#1a73e8' }} />
                ) : (
                    <GroupsOutlined sx={{ fontSize: 17, color: '#1a73e8' }} />
                )}
                <Typography
                    variant="body2"
                    noWrap
                    sx={{ fontWeight: 500, maxWidth: { xs: 110, sm: 180 }, color: '#202124' }}
                >
                    {activeTeam.name}
                </Typography>
                {activeRole && (
                    <Chip
                        label={ROLE_LABELS[activeRole] ?? activeRole}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.6875rem', display: { xs: 'none', sm: 'inline-flex' } }}
                    />
                )}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                slotProps={{ paper: { sx: { minWidth: 260, mt: 1 } } }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        ESPACIOS Y EQUIPOS
                    </Typography>
                </Box>
                <Divider />
                {teams.map((membership) => {
                    const isSelected = membership.teamId === activeTeamId;
                    return (
                        <MenuItem
                            key={membership.teamId}
                            selected={isSelected}
                            onClick={() => handleSelect(membership.teamId)}
                            sx={{ py: 1.25, gap: 1.5, justifyContent: 'space-between' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                                <ListItemIcon sx={{ minWidth: 0, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                                    {membership.team.isPersonal ? (
                                        <PersonOutlined fontSize="small" />
                                    ) : (
                                        <GroupsOutlined fontSize="small" />
                                    )}
                                </ListItemIcon>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" noWrap sx={{ fontWeight: isSelected ? 500 : 400 }}>
                                        {membership.team.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {membership.team.isPersonal ? 'Personal' : 'Equipo'} · {ROLE_LABELS[membership.role] ?? membership.role}
                                    </Typography>
                                </Box>
                            </Box>
                            {isSelected && <CheckOutlined fontSize="small" color="primary" />}
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
};
