import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const AlertMui = (props) => {
    const {severity, variant, title, text, onClose, icon} = props
    
    const alertSeverity = severity ? severity : "icon"
    const alertVariant = variant ? variant : "standard"

    return (
        <Alert 
            severity={alertSeverity} 
            variant={alertVariant} 
            onClose={onClose}
            icon={icon}>
            {title && <AlertTitle>{title}</AlertTitle>}
            {text}
        </Alert>
    );
};

export default AlertMui;