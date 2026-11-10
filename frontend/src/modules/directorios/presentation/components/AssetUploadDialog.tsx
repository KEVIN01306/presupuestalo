import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import FileInputZone from '../../../../shared/components/common/FileInputZone';
import CircularUploadProgress from '../../../../shared/components/common/CircularUploadProgress';
import { createAsset, type UploadProgressData } from '../../infrastructure/services/assets.service';

interface AssetUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    brandId: string;
    folderId?: string | null;
}

export const AssetUploadDialog: React.FC<AssetUploadDialogProps> = ({
    open,
    onClose,
    onSuccess,
    brandId,
    folderId = null,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sku, setSku] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [uploadProgress, setUploadProgress] = useState<UploadProgressData>({
        loaded: 0,
        total: 0,
        percentage: 0,
        speed: 0,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        if (selectedFile && !name.trim()) {
            // Auto-populate name with clean file name without extension
            const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
            setName(baseName);
        }
        if (errors.file) {
            setErrors((prev) => ({ ...prev, file: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) {
            newErrors.name = 'Asset name is required';
        }
        if (!file) {
            newErrors.file = 'A file is required to upload';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsSubmitting(false);
        setUploadProgress({ loaded: 0, total: 0, percentage: 0, speed: 0 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!validate()) return;
        if (!file) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsSubmitting(true);
        setUploadProgress({
            loaded: 0,
            total: file.size,
            percentage: 0,
            speed: 0,
        });

        try {
            await createAsset(
                {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    sku: sku.trim() || undefined,
                    brandId,
                    folderId,
                    file,
                },
                (progress) => {
                    setUploadProgress(progress);
                },
                controller.signal
            );

            handleClose();
            onSuccess();
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }

            let serverMsg = 'Failed to upload asset. Please try again.';
            if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
                serverMsg = 'Upload timed out. The file took too long to transfer. Please check your connection and try again.';
            } else if (err.response?.data?.message) {
                serverMsg = err.response.data.message;
            } else if (err.message === 'Network Error') {
                serverMsg = 'Network error during upload. Please check your internet connection.';
            } else if (err.message) {
                serverMsg = err.message;
            }

            setErrorMessage(serverMsg);
        } finally {
            setIsSubmitting(false);
            abortControllerRef.current = null;
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setName('');
        setDescription('');
        setSku('');
        setFile(null);
        setErrors({});
        setErrorMessage(null);
        setUploadProgress({ loaded: 0, total: 0, percentage: 0, speed: 0 });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '16px',
                        p: 1,
                    },
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                    {isSubmitting ? 'Uploading Asset' : 'Upload New Asset'}
                </Typography>
                <IconButton
                    size="small"
                    onClick={isSubmitting ? handleCancelUpload : handleClose}
                    disabled={isSubmitting && uploadProgress.percentage >= 100}
                >
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            {isSubmitting ? (
                <DialogContent sx={{ pt: 1, pb: 3 }}>
                    <CircularUploadProgress
                        file={file}
                        progress={uploadProgress.percentage}
                        speed={uploadProgress.speed}
                        loadedBytes={uploadProgress.loaded}
                        totalBytes={uploadProgress.total || file?.size || 0}
                        isProcessing={uploadProgress.percentage >= 100}
                        onCancel={handleCancelUpload}
                    />
                </DialogContent>
            ) : (
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 1 }}>
                        <Stack spacing={2.5}>
                            {errorMessage && (
                                <Alert severity="error" sx={{ borderRadius: '10px' }}>
                                    {errorMessage}
                                </Alert>
                            )}

                            <FileInputZone
                                file={file}
                                onChange={handleFileChange}
                                error={errors.file}
                                disabled={isSubmitting}
                            />

                            <TextField
                                label="Asset Name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                                }}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                                placeholder="e.g. Honda CBR 1000 Front View"
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                required
                            />

                            <TextField
                                label="SKU (Optional)"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="e.g. HONDA-CBR-1000"
                                helperText="If provided, the file will be stored in R2 using this SKU as its base name"
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                            />

                            <TextField
                                label="Description (Optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add brief details about this asset..."
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                disabled={isSubmitting}
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                        <Button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            sx={{ textTransform: 'none', borderRadius: '10px', color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                px: 3,
                            }}
                        >
                            Upload Asset
                        </Button>
                    </DialogActions>
                </form>
            )}
        </Dialog>
    );
};

export default AssetUploadDialog;
