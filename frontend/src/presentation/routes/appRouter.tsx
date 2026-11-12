import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { authRoutes } from '../../modules/auth/presentation/auth.routes';
import { budgetsRoutes } from '../../modules/budgets/presentation/budgets.routes';
import { profileRoutes } from '../../modules/profile/presentation/profile.routes';
import { auditRoutes } from '../../modules/audit/presentation/audit.routes';
import { teamsRoutes } from '../../modules/teams/presentation/teams.routes';
import ProtectedRoute from './ProtectedRoute';

import { FullPageLoader } from '../../shared/components/loaders';
import { AccessDeniedPage } from '../../shared/pages';
import DashboardPage from '../../shared/pages/Dashboard.page';

const BlankLayout = lazy(() => import('../layouts/blankLayout'));
const FullLayout = lazy(() => import('../layouts/fullLayout'));

export const appRouter = createBrowserRouter([
    {
        path: '/auth',
        element: (
            <Suspense fallback={<FullPageLoader />}>
                <BlankLayout />
            </Suspense>
        ),
        children: [...authRoutes],
    },
    {
        path: '/',
        element: (
            <Suspense fallback={<FullPageLoader />}>
                <ProtectedRoute />
            </Suspense>
        ),
        children: [
            {
                element: (
                    <Suspense fallback={<FullPageLoader />}>
                        <FullLayout />
                    </Suspense>
                ),
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: 'budgets', children: [...budgetsRoutes] },
                    { path: 'access-denied', element: <AccessDeniedPage /> },
                    { path: 'teams', children: [...teamsRoutes] },
                    { path: 'audit', children: [...auditRoutes] },
                    { path: 'audit-logs', children: [...auditRoutes] },
                    { path: 'profile', children: [...profileRoutes] },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
