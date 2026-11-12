import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatDate } from '../../../../core/utils/formatDate';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { TeamMemberDetail } from '../../../teams/domain/interfaces/team.interface';
import type { BudgetItem, Expense } from '../../domain/interfaces/budget.interface';
import type { ExpenseFormValues } from '../../domain/schemas/budget.schema';
import { ExpenseFormDialog } from './ExpenseFormDialog';

interface BudgetExpensesTabProps {
    expenses: Expense[];
    items: BudgetItem[];
    members: TeamMemberDetail[];
    defaultUserId: string;
    canEdit: boolean;
    onSave: (values: ExpenseFormValues, expenseId?: string) => Promise<void>;
    onDelete: (expenseId: string) => Promise<void>;
}

export const BudgetExpensesTab: React.FC<BudgetExpensesTabProps> = ({
    expenses,
    items,
    members,
    defaultUserId,
    canEdit,
    onSave,
    onDelete,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500 }}>
                            Gastos reales
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#1a73e8', fontWeight: 500 }}>
                            Total gastado: {formatCurrency(totalSpent, symbol)}
                        </Typography>
                    </Box>
                    {canEdit && (
                        <Button
                            variant="contained"
                            disabled={items.length === 0}
                            startIcon={<AddOutlined />}
                            onClick={() => { setEditing(null); setDialogOpen(true); }}
                            sx={{ borderRadius: '200px', textTransform: 'none', px: 2.5 }}
                        >
                            Registrar gasto
                        </Button>
                    )}
                </Stack>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Rubro</TableCell>
                                <TableCell>Pagado por</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell align="right">Monto</TableCell>
                                {canEdit && <TableCell align="right">Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canEdit ? 6 : 5} align="center" sx={{ py: 3, color: '#5f6368' }}>
                                        No hay gastos registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.map((exp) => (
                                    <TableRow key={exp.id}>
                                        <TableCell>{formatDate(exp.date)}</TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{exp.budgetItem?.name ?? '—'}</TableCell>
                                        <TableCell>{exp.paidBy ? `${exp.paidBy.firstName} ${exp.paidBy.lastName}` : '—'}</TableCell>
                                        <TableCell>{exp.description || '—'}</TableCell>
                                        <TableCell align="right" sx={{ color: '#1a73e8', fontWeight: 500 }}>
                                            {formatCurrency(exp.amount, symbol)}
                                        </TableCell>
                                        {canEdit && (
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => { setEditing(exp); setDialogOpen(true); }}>
                                                    <EditOutlined fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => onDelete(exp.id)}>
                                                    <DeleteOutlined fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <ExpenseFormDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    initialExpense={editing}
                    items={items}
                    members={members}
                    defaultUserId={defaultUserId}
                    onSubmitValues={onSave}
                />
            </CardContent>
        </Card>
    );
};
