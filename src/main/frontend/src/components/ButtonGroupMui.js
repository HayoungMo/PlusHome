import React from 'react';
import {Button, ButtonGroup} from '@mui/material';

const ButtonGroupMui = (props) => {
    const {disabled, button, variant, size, color, orientation} = props

    const buttonList = button.length > 0 ? button : []
    const isDisabled = disabled ? true : false
    const buttonVariant = variant ? variant : "contained"
    const buttonOrientation = orientation ? orientation : "horizontal"
    
    return (
        <div>
            <ButtonGroup 
            size={size}
            color={color}
            variant={buttonVariant}
            orientation={buttonOrientation}
            disabled={isDisabled}>
            { 
                buttonList?.map((record)=>{
                   console.log(record)
                   return(<Button key={record.title} onClick={record.onClick}>{record.title}</Button>)
                })
            }
            </ButtonGroup>
        </div>
    );
};

export default ButtonGroupMui;