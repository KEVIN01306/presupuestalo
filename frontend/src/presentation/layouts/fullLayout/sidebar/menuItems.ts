import {
    DashboardOutlined,
    AccountBalanceWalletOutlined,
    GroupsOutlined,
    ManageHistoryOutlined,
    PersonOutlineOutlined,
} from '@mui/icons-material';
import type { ElementType } from 'react';

export interface MenuItem {
    name?: string;
    module?: string;
    group?: string;
    link?: string;
    icon?: ElementType;
    children?: MenuItem[];
}

const MenuItems: MenuItem[] = [
    { group: 'Principal' },
    {
        name: 'Dashboard',
        icon: DashboardOutlined,
        link: '/',
    },
    { group: 'Gestión' },
    {
        module: 'Budgets',
        name: 'Presupuestos',
        icon: AccountBalanceWalletOutlined,
        link: '/budgets',
    },
    {
        module: 'Teams',
        name: 'Equipos',
        icon: GroupsOutlined,
        link: '/teams',
    },
    { group: 'Sistema' },
    {
        module: 'Audit',
        name: 'Auditoría',
        icon: ManageHistoryOutlined,
        link: '/audit-logs',
    },
    {
        name: 'Perfil',
        icon: PersonOutlineOutlined,
        link: '/profile',
    },
];

export default MenuItems;
