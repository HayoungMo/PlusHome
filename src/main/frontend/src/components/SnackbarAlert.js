import React from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarAlert = ({
    open,
    message,
    severity = "success",
    onClose,
    duration = 3000,
 
    anchorOrigin = { vertical: "top", horizontal: "center" },
}) => (
    <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
       
        sx={{
            position: "fixed",
            top: "50% !important",
            left: "50% !important",
            transform: "translate(-50%, -50%) !important", // 정중앙 정렬 공식
            bottom: "auto !important", // MUI 기본 bottom 스타일 완전 무력화
        }}
    >
        <Alert
            onClose={onClose}
            severity={severity}
            variant="filled"
            sx={{ 
                width: "100%", 
                minWidth: 260,
                boxShadow: 3 
            }}
        >
            {message}
        </Alert>
    </Snackbar>
);

export default SnackbarAlert;