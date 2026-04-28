import React from 'react';
import {Box, TextField} from '@mui/material';

const TextFieldMui = (props) => {
    const {label, value, onChange, name, disabled, required, error, helperText, multiline, type, variant, width} = props

    const textVariant = variant ? variant : "outlined"
    const isDisabled = disabled ? true : false
    const isRequired = required ? true : false
    const isError = error ? true : false
    const isMultiline = multiline ? true : false

    return (
        <Box sx={{ width: width ? width : "200px" }}>
            <TextField 
                name={name}
                label={label}
                value={value}
                disabled={isDisabled}
                onChange={onChange}
                helperText={helperText}
                type={type}
                variant={textVariant}
                required={isRequired}
                error={isError}
                multiline={isMultiline}
                fullWidth
            >
                
            </TextField>
        </Box>
    );
};

export default TextFieldMui;