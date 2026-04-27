import React from 'react';
import {Radio, RadioGroup, FormControlLabel, FormControl, FormLabel} from "@mui/material";

const RadioMui = (props) => {
    const {className,value,name,label, labelList, width,onChange} = props;
    
    return (
        <div className={className} style={{ width: width ? width : "200px" }}>
            <FormControl>
                <FormLabel id={`controlled-radio-buttons-${name}`}>{label}</FormLabel>
                <RadioGroup
                    aria-labelledby={`controlled-radio-buttons-${name}`}
                    name={name}
                    value={value}
                    onChange={onChange}
                >    
                    {labelList?.map((record)=>(
                            <FormControlLabel
                                key={`${name}-${record.value}`}
                                value={record.value}
                                control={<Radio/>}
                                label={record.title}/>
                        ))
                    }
                
                </RadioGroup>
            </FormControl>
        </div>
    );
};

export default RadioMui;