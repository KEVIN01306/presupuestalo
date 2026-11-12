import React, { useEffect, useState } from 'react';
import { Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useAuthStore } from '../../../../core/store/authStore';
import { getCurrentUser } from '../../../auth/infrastructure/services/auth.service';
import type { AuthUser } from '../../../auth/domain/interfaces/auth.interfaces';
import { ProfileHeaderCard } from '../components/ProfileHeaderCard';
import { ProfileDetailsCard } from '../components/ProfileDetailsCard';
import { ProfileTeamsCard } from '../components/ProfileTeamsCard';
import { ProfileEditDialog } from '../components/ProfileEditDialog';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';

export const ProfilePage: React.FC = () => {
    const { user, accessToken, teams, activeTeamId, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) return;
        setLoading(true);
        getCurrentUser(accessToken)
            .then((fresh) => setUser(fresh))
            .catch(() => setError('No se pudo actualizar la información del perfil.'))
            .finally(() => setLoading(false));
    }, [accessToken, setUser]);

    const handleProfileUpdated = (updated: AuthUser) => {
        setUser({ ...updated, teamMemberships: updated.teamMemberships ?? teams });
        setToast('Perfil actualizado correctamente.');
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            {loading && !user && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <ProfileHeaderCard
                profile={user}
                onEditProfile={() => setEditOpen(true)}
                onChangePassword={() => setPasswordOpen(true)}
            />
            <ProfileDetailsCard profile={user} />
            <ProfileTeamsCard memberships={teams} activeTeamId={activeTeamId} />

            <ProfileEditDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                user={user}
                onSuccess={handleProfileUpdated}
            />
            <ChangePasswordDialog
                open={passwordOpen}
                onClose={() => setPasswordOpen(false)}
                onSuccess={() => setToast('Contraseña actualizada correctamente.')}
            />

            <Snackbar
                open={Boolean(toast)}
                autoHideDuration={3000}
                onClose={() => setToast(null)}
                message={toast}
            />
        </Box>
    );
};

export default ProfilePage;
