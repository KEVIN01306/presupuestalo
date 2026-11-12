import React, { useState } from 'react';
import { Alert, Box, CircularProgress, Grid, Snackbar, Stack } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { PageHeader } from '../../../../shared/components/common/PageHeader';
import ConfirmDialog from '../../../../shared/components/dialog/ConfirmDialog';
import type { IncomeCategory, TeamMemberDetail } from '../../domain/interfaces/team.interface';
import { useTeams } from '../hooks/useTeams';
import { TeamListPanel } from '../components/TeamListPanel';
import { TeamDetailHeader } from '../components/TeamDetailHeader';
import { TeamMembersCard } from '../components/TeamMembersCard';
import { IncomeCategoriesCard } from '../components/IncomeCategoriesCard';
import { TeamFormDialog } from '../components/TeamFormDialog';
import { AddMemberDialog } from '../components/AddMemberDialog';
import { IncomeCategoryDialog } from '../components/IncomeCategoryDialog';

export const TeamsPage: React.FC = () => {
    const t = useTeams();
    const [teamDialog, setTeamDialog] = useState<'create' | 'edit' | null>(null);
    const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [expelTarget, setExpelTarget] = useState<TeamMemberDetail | null>(null);
    const [catDialog, setCatDialog] = useState<{ open: boolean; item: IncomeCategory | null }>({ open: false, item: null });
    const [deleteCatTarget, setDeleteCatTarget] = useState<IncomeCategory | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const userRole = t.selectedSummary?.role ?? 'VIEWER';
    const runConfirm = async (fn: () => Promise<void>, close: () => void) => {
        setConfirmLoading(true);
        try {
            await fn();
            close();
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <PageHeader
                title="Equipos y Categorías"
                subtitle="Administra tus espacios colaborativos, miembros y categorías de ingreso"
                actionLabel="Crear equipo"
                actionIcon={<AddOutlined />}
                onAction={() => setTeamDialog('create')}
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TeamListPanel
                        teams={t.teams}
                        selectedTeamId={t.selectedTeamId}
                        activeTeamId={t.activeTeamId}
                        loading={t.loadingList}
                        onSelect={t.setSelectedTeamId}
                        onSwitchTeam={t.handleSwitchTeam}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    {t.loadingDetail && !t.teamDetail ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : t.teamDetail ? (
                        <Stack sx={{ gap: 3 }}>
                            <TeamDetailHeader
                                team={t.teamDetail}
                                userRole={userRole}
                                onEdit={() => setTeamDialog('edit')}
                                onDelete={() => setDeleteTeamOpen(true)}
                            />
                            <TeamMembersCard
                                members={t.teamDetail.members}
                                teamOwnerId={t.teamDetail.ownerId}
                                userRole={userRole}
                                isPersonal={t.teamDetail.isPersonal}
                                onInvite={() => setAddMemberOpen(true)}
                                onChangeRole={t.handleChangeMemberRole}
                                onExpel={setExpelTarget}
                            />
                            <IncomeCategoriesCard
                                categories={t.categories}
                                userRole={userRole}
                                onCreate={() => setCatDialog({ open: true, item: null })}
                                onEdit={(item) => setCatDialog({ open: true, item })}
                                onDelete={setDeleteCatTarget}
                            />
                        </Stack>
                    ) : null}
                </Grid>
            </Grid>

            <TeamFormDialog
                open={teamDialog !== null}
                onClose={() => setTeamDialog(null)}
                initialTeam={teamDialog === 'edit' ? t.teamDetail : null}
                currencies={t.currencies}
                onSubmitValues={teamDialog === 'edit' ? t.handleUpdateTeam : t.handleCreateTeam}
            />
            <AddMemberDialog
                open={addMemberOpen}
                onClose={() => setAddMemberOpen(false)}
                onSubmitValues={t.handleAddMember}
            />
            <IncomeCategoryDialog
                open={catDialog.open}
                onClose={() => setCatDialog({ open: false, item: null })}
                initialCategory={catDialog.item}
                onSubmitValues={(vals) =>
                    catDialog.item
                        ? t.handleUpdateCategory(catDialog.item.id, vals)
                        : t.handleCreateCategory(vals)
                }
            />
            <ConfirmDialog
                open={deleteTeamOpen}
                title="Eliminar equipo"
                description={`¿Seguro que deseas eliminar "${t.teamDetail?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isLoading={confirmLoading}
                onClose={() => setDeleteTeamOpen(false)}
                onConfirm={() => runConfirm(t.handleDeleteTeam, () => setDeleteTeamOpen(false))}
            />
            <ConfirmDialog
                open={Boolean(expelTarget)}
                title="Expulsar miembro"
                description={`¿Seguro que deseas expulsar a ${expelTarget?.user.firstName} ${expelTarget?.user.lastName} del equipo?`}
                confirmText="Expulsar"
                isLoading={confirmLoading}
                onClose={() => setExpelTarget(null)}
                onConfirm={() => expelTarget && runConfirm(() => t.handleExpelMember(expelTarget.id), () => setExpelTarget(null))}
            />
            <ConfirmDialog
                open={Boolean(deleteCatTarget)}
                title="Eliminar categoría"
                description={`¿Seguro que deseas eliminar la categoría "${deleteCatTarget?.name}"?`}
                confirmText="Eliminar"
                isLoading={confirmLoading}
                onClose={() => setDeleteCatTarget(null)}
                onConfirm={() => deleteCatTarget && runConfirm(() => t.handleDeleteCategory(deleteCatTarget.id), () => setDeleteCatTarget(null))}
            />
            <Snackbar open={Boolean(t.toast)} autoHideDuration={3500} onClose={t.clearToast}>
                {t.toast ? <Alert severity={t.toast.severity}>{t.toast.message}</Alert> : undefined}
            </Snackbar>
        </Box>
    );
};

export default TeamsPage;
