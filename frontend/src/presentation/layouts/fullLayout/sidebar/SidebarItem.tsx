import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Tooltip,
    Collapse,
    List,
    Box,
    Divider,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import type { MenuItem } from './menuItems';
import { useSidebar } from './SidebarContext';

interface SidebarItemProps {
    item: MenuItem;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ item }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isCollapsed, closeMobileSidebar } = useSidebar();
    const [openSubmenu, setOpenSubmenu] = useState(false);

    if (item.group) {
        if (isCollapsed) {
            return <Divider sx={{ my: 1 }} />;
        }
        return (
            <Box sx={{ px: 3, pt: 2, pb: 0.5 }}>
                <Typography
                    variant="caption"
                    sx={{ fontWeight: 500, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                    {item.group}
                </Typography>
            </Box>
        );
    }

    const IconComponent = item.icon;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isActive = item.link
        ? item.link === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.link)
        : false;

    const handleClick = () => {
        if (hasChildren) {
            setOpenSubmenu(!openSubmenu);
        } else if (item.link) {
            navigate(item.link);
            closeMobileSidebar();
        }
    };

    const buttonContent = (
        <ListItemButton
            selected={isActive}
            onClick={handleClick}
            sx={{
                minHeight: 42,
                px: isCollapsed ? 2 : 2.5,
                mx: isCollapsed ? 1 : 1.5,
                my: 0.25,
                borderRadius: '8px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
        >
            {IconComponent && (
                <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 1.75, justifyContent: 'center' }}>
                    <IconComponent sx={{ fontSize: 20 }} />
                </ListItemIcon>
            )}
            {!isCollapsed && (
                <ListItemText
                    primary={item.name}
                    slotProps={{ primary: { variant: 'body2', sx: { fontWeight: isActive ? 500 : 400 } } }}
                />
            )}
            {!isCollapsed && hasChildren && (openSubmenu ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
        </ListItemButton>
    );

    return (
        <>
            {isCollapsed ? (
                <Tooltip title={item.name ?? ''} placement="right" arrow>
                    {buttonContent}
                </Tooltip>
            ) : (
                buttonContent
            )}
            {hasChildren && !isCollapsed && (
                <Collapse in={openSubmenu} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                        {item.children?.map((child, idx) => (
                            <SidebarItem key={child.name || idx} item={child} />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

export default SidebarItem;
