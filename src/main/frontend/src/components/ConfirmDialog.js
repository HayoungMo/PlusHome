import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = "저장",
    cancelLabel = "취소",
    confirmColor = "primary",
    onConfirm,
    onClose,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
                {cancelLabel}
            </Button>
            <Button variant="outlined" color={confirmColor} onClick={onConfirm} autoFocus>
                {confirmLabel}
            </Button>
        </DialogActions>
    </Dialog>
);

export default ConfirmDialog;
