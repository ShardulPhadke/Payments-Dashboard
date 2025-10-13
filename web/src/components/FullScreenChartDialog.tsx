'use client';

import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Typography,
} from '@mui/material';
import { Close, Fullscreen, FullscreenExit } from '@mui/icons-material';

interface FullScreenChartDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

/**
 * Full-Screen Chart Dialog
 * 
 * Displays charts in full-screen mode for better analysis.
 */
export default function FullScreenChartDialog({
    open,
    onClose,
    title,
    children,
}: FullScreenChartDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullScreen
            PaperProps={{
                sx: {
                    bgcolor: 'grey.100',
                },
            }}
        >
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    bgcolor: 'white',
                    borderBottom: 1,
                    borderColor: 'divider',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    {title}
                </Typography>
                <IconButton onClick={onClose} size="large">
                    <Close />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 4 }}>
                {children}
            </DialogContent>
        </Dialog>
    );
}