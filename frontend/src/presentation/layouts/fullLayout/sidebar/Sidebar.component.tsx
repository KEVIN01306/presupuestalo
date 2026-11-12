import React from 'react';
import { Box, Drawer, List, Typography, Stack, Divider } from '@mui/material';
import MenuItems from './menuItems';
import SidebarItem from './SidebarItem';
import { useSidebar, SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './SidebarContext';

const SidebarContent: React.FC = () => {
    const { isCollapsed } = useSidebar();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff', overflowX: 'hidden' }}>
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: 1.5,
                    px: isCollapsed ? 1 : 2.5,
                    minHeight: 64,
                    borderBottom: '1px solid #dadce0',
                }}
            >
                <Box
                    component="img"
                    src="/icon.png"
                    alt="Presupuestalo"
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        objectFit: 'contain',
                        flexShrink: 0,
                    }}
                />
                {!isCollapsed && (
                    <Typography variant="h5" noWrap sx={{ fontWeight: 500, color: '#202124' }}>
                        Presupuesto
                    </Typography>
                )}
            </Stack>

            <List sx={{ flex: 1, py: 1.5, px: 0, overflowY: 'auto' }}>
                {MenuItems.map((item, index) => (
                    <SidebarItem key={item.name || item.group || index} item={item} />
                ))}
            </List>

            <Divider />
            <Box sx={{ px: isCollapsed ? 1 : 2.5, py: 1.5, textAlign: isCollapsed ? 'center' : 'left' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {isCollapsed ? 'v1' : 'Presupuesto v1.0'}
                </Typography>
            </Box>
        </Box>
    );
};

export const Sidebar: React.FC = () => {
    const { isMobileOpen, closeMobileSidebar, isCollapsed } = useSidebar();
    const currentWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

    return (
        <Box component="nav" sx={{ width: { md: currentWidth }, flexShrink: { md: 0 }, transition: 'width 0.25s ease' }}>
            <Drawer
                variant="temporary"
                open={isMobileOpen}
                onClose={closeMobileSidebar}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: SIDEBAR_EXPANDED_WIDTH, boxSizing: 'border-box' },
                }}
            >
                <SidebarContent />
            </Drawer>
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: currentWidth,
                        boxSizing: 'border-box',
                        transition: 'width 0.25s ease',
                        overflowX: 'hidden',
                    },
                }}
            >
                <SidebarContent />
            </Drawer>
        </Box>
    );
};

export default Sidebar;
