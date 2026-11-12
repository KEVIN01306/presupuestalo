import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Toolbar, IconButton, Typography, Avatar, Box,
    Tooltip, Menu, MenuItem, ListItemIcon, Divider,
} from '@mui/material';
import { MenuOutlined, MenuOpenOutlined, PersonOutlined, LogoutOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { logoutUser } from '../../../../modules/auth/infrastructure/services/auth.service';
import { useSidebar, SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../sidebar/SidebarContext';
import { TeamSwitcher } from './TeamSwitcher.component';

export const Navbar: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { user, accessToken, clearAuth } = useAuthStore();
    const { toggleSidebar, isCollapsed } = useSidebar();
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
    const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Usuario';
    const initials = user
        ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
        : 'U';

    const handleLogout = async () => {
        setAnchorEl(null);
        try {
            await logoutUser(accessToken);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            clearAuth();
            navigate('/auth/login', { state: { from: location } });
        }
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { md: `calc(100% - ${sidebarWidth}px)` },
                ml: { md: `${sidebarWidth}px` },
                transition: 'width 0.25s ease, margin-left 0.25s ease',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #dadce0',
                color: '#202124',
            }}
        >
            <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 }, gap: 1.5 }}>
                <Tooltip title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'} arrow>
                    <IconButton
                        id="navbar-toggle-sidebar"
                        aria-label="Alternar barra lateral"
                        edge="start"
                        onClick={toggleSidebar}
                        sx={{ color: '#5f6368', borderRadius: '8px', '&:hover': { bgcolor: '#f8f9fa' } }}
                    >
                        {isCollapsed ? <MenuOpenOutlined /> : <MenuOutlined />}
                    </IconButton>
                </Tooltip>

                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <TeamSwitcher />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#202124', lineHeight: 1.2 }}>
                            {fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5f6368' }}>
                            {user?.email ?? ''}
                        </Typography>
                    </Box>

                    <Tooltip title="Cuenta" arrow>
                        <IconButton id="navbar-user-menu-button" onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                            <Avatar src={user?.avatarUrl || undefined} sx={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                                {initials}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Box>

                <Menu
                    id="user-account-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2">{fullName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {user?.email ?? ''}
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ gap: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 0, color: 'text.secondary' }}>
                            <PersonOutlined fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2">Mi Perfil</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 0, color: 'error.main' }}>
                            <LogoutOutlined fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                            Cerrar sesión
                        </Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
