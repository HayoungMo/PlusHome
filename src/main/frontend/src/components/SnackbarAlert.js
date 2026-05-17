import React from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarAlert = ({
    open,
    message,
    severity = "success",
    onClose,
    duration = 3000,
    anchorOrigin = { vertical: "bottom", horizontal: "center" },
}) => (
    <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
    >
        <Alert
            onClose={onClose}
            severity={severity}
            variant="filled"
            sx={{ width: "100%", minWidth: 260 }}
        >
            {message}
        </Alert>
    </Snackbar>
);

export default SnackbarAlert;
