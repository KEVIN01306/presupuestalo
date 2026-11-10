import React, { useRef, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Stack,
    FormHelperText,
} from '@mui/material';
import {
    CloudUpload,
    Close,
    InsertDriveFile,
    PictureAsPdf,
    Image as ImageIcon,
} from '@mui/icons-material';

interface FileInputZoneProps {
    file: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    accept?: string;
    maxSizeMb?: number;
    disabled?: boolean;
}

export const FileInputZone: React.FC<FileInputZoneProps> = ({
    file,
    onChange,
    error,
    accept,
    maxSizeMb = 300,
    disabled = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    const handleFile = (selectedFile: File | undefined) => {
        if (!selectedFile) return;

        if (selectedFile.size > maxSizeMb * 1024 * 1024) {
            alert(`File size exceeds the maximum allowed size of ${maxSizeMb}MB.`);
            return;
        }

        onChange(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return <ImageIcon sx={{ fontSize: 32, color: 'primary.main' }} />;
        if (fileType.includes('pdf')) return <PictureAsPdf sx={{ fontSize: 32, color: '#ef4444' }} />;
        return <InsertDriveFile sx={{ fontSize: 32, color: 'text.secondary' }} />;
    };

    return (
        <Box sx={{ width: '100%' }}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                style={{ display: 'none' }}
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                    }
                }}
                disabled={disabled}
            />

            {!file ? (
                <Paper
                    variant="outlined"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !disabled && inputRef.current?.click()}
                    sx={{
                        p: 3,
                        borderStyle: 'dashed',
                        borderWidth: '2px',
                        borderColor: error ? 'error.main' : isDragOver ? 'primary.main' : 'divider',
                        borderRadius: '12px',
                        bgcolor: isDragOver ? 'action.hover' : 'background.paper',
                        textAlign: 'center',
                        cursor: disabled ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: !disabled ? 'primary.main' : undefined,
                            bgcolor: !disabled ? 'action.hover' : undefined,
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1.5,
                        }}
                    >
                        <CloudUpload sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Click to upload or drag and drop
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Images (PNG, JPG, WEBP, SVG), PDFs, Documents up to {maxSizeMb}MB
                    </Typography>
                </Paper>
            ) : (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: '12px',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    {previewUrl ? (
                        <Box
                            component="img"
                            src={previewUrl}
                            alt="preview"
                            sx={{
                                width: 56,
                                height: 56,
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '8px',
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {getFileIcon(file.type)}
                        </Box>
                    )}

                    <Stack sx={{ minWidth: 0, flex: 1 }} spacing={0.5}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatBytes(file.size)} • {file.type || 'Unknown type'}
                        </Typography>
                    </Stack>

                    {!disabled && (
                        <IconButton
                            size="small"
                            onClick={() => onChange(null)}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    )}
                </Paper>
            )}

            {error && (
                <FormHelperText error sx={{ mt: 1, ml: 1 }}>
                    {error}
                </FormHelperText>
            )}
        </Box>
    );
};

export default FileInputZone;
