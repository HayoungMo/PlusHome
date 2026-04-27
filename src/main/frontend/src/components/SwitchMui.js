import React from 'react';
import { Switch, FormGroup, FormControlLabel,FormControl, FormLabel } from '@mui/material';


const SwitchMui = (props) => {
    const {className, checked, onChange, label, name, disabled, width} =props

    const switchName = name !== null && name !== "" && name !== undefined ? name : "switchMui";
    const isDisabled = disabled ? true : false;

    return (
        <div className={className} style={{
            width:width?width:"200px"}}>
            <FormControl>
                <FormLabel id={`switch-group-${switchName}`}>{label}</FormLabel>
                    <FormGroup aria-labelledby={`switch-group-${switchName}`}>
                        <FormControlLabel         
                            control={
                                <Switch
                                    name={switchName}
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

export default SwitchMui;