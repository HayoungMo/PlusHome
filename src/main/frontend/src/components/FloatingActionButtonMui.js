import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material';

const FloatingActionButtonMui = (props) => {
    const {onClick, color, size, disabled, icon} = props

    const fabColor = color ? color : "primary"
    const fabSize = size ? size : "large"
    const isDisabled = disabled ? true : false

    return (
        <Fab
            color={fabColor}
            size={fabSize}
            disabled={isDisabled}
            onClick={onClick}>
            {icon}
        </Fab>

    );
};

export default FloatingActionButtonMui;