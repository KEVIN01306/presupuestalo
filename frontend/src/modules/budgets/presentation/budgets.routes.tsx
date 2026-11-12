import type { RouteObject } from 'react-router-dom';
import { BudgetDetailPage, BudgetsListPage } from './budgets.lazy';

export const budgetsRoutes: RouteObject[] = [
    {
        index: true,
        element: <BudgetsListPage />,
    },
    {
        path: ':budgetId',
        element: <BudgetDetailPage />,
    },
];
