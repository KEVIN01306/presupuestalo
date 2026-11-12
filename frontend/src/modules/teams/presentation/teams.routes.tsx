import type { RouteObject } from 'react-router-dom';
import { RouteProtector } from '../../../shared/components/RouteProtector';
import { TeamsPage } from './teams.lazy';

export const teamsRoutes: RouteObject[] = [
    {
        index: true,
        element: (
            <RouteProtector>
                <TeamsPage />
            </RouteProtector>
        ),
    },
];
