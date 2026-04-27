import React from 'react';
import {Checkbox, FormControl,FormControlLabel,FormGroup,FormLabel} from '@mui/material'; 

const CheckboxMui = (props) => {
    const {className, checked, onChange, label, name, disabled, width} = props 
    
    const checkboxName = name !== null && name !== "" && name !== undefined ? name : "checkboxMui";
    const isDisabled = disabled ? true : false;

    return (
        <div className={className} style={{
            width:width?width:"200px"
        }}>
            <FormControl>
                <FormLabel id={`checkbox-group-${checkboxName}`}>{label}</FormLabel>
                <FormGroup aria-labelledby={`checkbox-group-${checkboxName}`}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name={checkboxName}
                                checked={checked}
                                onChange={onChange}
                                disabled={isDisabled}
                            />
                        }>
                    </FormControlLabel>
                </FormGroup>
            </FormControl>
            
        </div>
    );
};

export default CheckboxMui;