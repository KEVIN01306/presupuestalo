import React from 'react';
import {
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { useAuthStore } from '../../../../core/store/authStore';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import type { BudgetUserSegmentation } from '../../domain/interfaces/budget.interface';

interface MemberSegmentationTableProps {
    rows: BudgetUserSegmentation[];
}

export const MemberSegmentationTable: React.FC<MemberSegmentationTableProps> = ({ rows }) => {
    const symbol = useAuthStore((s) => s.activeTeam?.currency?.symbol || '$');
    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #dadce0', boxShadow: 'none', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#202124', fontWeight: 500, mb: 2 }}>
                    Segmentación por miembro
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#5f6368', fontWeight: 500 }}>Miembro</TableCell>
                                <TableCell align="right" sx={{ color: '#5f6368', fontWeight: 500 }}>Aportado</TableCell>
                                <TableCell align="right" sx={{ color: '#5f6368', fontWeight: 500 }}>Asignado</TableCell>
                                <TableCell align="right" sx={{ color: '#5f6368', fontWeight: 500 }}>Pagado</TableCell>
                                <TableCell align="right" sx={{ color: '#5f6368', fontWeight: 500 }}>Por pagar</TableCell>
                                <TableCell align="right" sx={{ color: '#5f6368', fontWeight: 500 }}>Sobr. Proy.</TableCell>
                                <TableCell align="right" sx={{ color: '#5f6368', fontWeight: 500 }}>Sobr. Real</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.userId}>
                                    <TableCell sx={{ color: '#202124', fontWeight: 500 }}>
                                        {row.firstName} {row.lastName}
                                    </TableCell>
                                    <TableCell align="right">{formatCurrency(row.contributedIncome, symbol)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.assignedToPay, symbol)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.totalPaid, symbol)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.remainingToPay, symbol)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.projectedRemainder, symbol)}</TableCell>
                                    <TableCell align="right" sx={{ color: '#188038', fontWeight: 500 }}>
                                        {formatCurrency(row.realRemainder, symbol)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
