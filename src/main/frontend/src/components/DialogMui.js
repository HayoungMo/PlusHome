import React from 'react';
import { Button, Dialog,DialogActions,DialogContent, DialogContentText, DialogTitle} from '@mui/material';

const DialogMui = (props) => {
    const {open, onClose, title, text, buttons, maxWidth, fullWidth}=props
    
    const isFullWidth = fullWidth ? true : false
    const dialogMaxWidth = maxWidth ? maxWidth : "sm"

    return (
        <Dialog 
            onClose={onClose} 
            open={open}
            maxWidth={dialogMaxWidth}
            fullWidth={isFullWidth}
            >

            {title && <DialogTitle>{title}</DialogTitle> }
            
            <DialogContent>
                <DialogContentText>{text}</DialogContentText>
            </DialogContent>

            <DialogActions>
                {buttons?.map((button)=>(
                    <Button key={button.title} onClick={button.onClick}>
                        {button.title}
                    </Button>
                ))}
            </DialogActions>
        </Dialog>
    );
};

export default DialogMui;