import React from 'react';
import {Select,FormControl,InputLabel,FormHelperText,MenuItem} from '@mui/material';

const SelectMui = (props) => {
    const {label, value, onChange, option, name, required, width } = props;

    const optionList = option.length === 0 ? [] : option;
    const selectName = name !== "" && name !==null && name !== undefined ? name : "selectMui";
    const requiredOption = required !=="" && required !==null && required !== undefined ? true: false;

    return (
        <div style={{ width: width ? width : "200px" }}>
            <FormControl>
                <InputLabel id={`select-label-${selectName}`}>{label}</InputLabel>
                <Select
                    labelId={`select-label-${selectName}`}
                    name={selectName}
                    id="demo-select-name"
                    onChange={onChange}
                    value={value}
                    label={label}
                >
                {
                    optionList?.map((item)=>(
                        <MenuItem key={`${name}-${item.value}`} value={item.value}>
                            {item.title}
                        </MenuItem>
                    ))
                }
                </Select>
                {requiredOption && <FormHelperText>Required</FormHelperText>}
            </FormControl>
            
        </div>
    );
};

export default SelectMui;