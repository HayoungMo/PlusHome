import React from 'react';
import { Rating } from '@mui/material';
const RatingMui = (props) => {
    const {value, name, onChange, precision, size, disabled, readOnly, max} = props

    const ratingName = name ? name : "ratingMui"
    const ratingPrecision = precision ? precision : 1
    const ratingSize = size ? size : "medium"
    const ratingMax = max ? max : 5
    const isDisabled = disabled ? true : false
    const isReadOnly = readOnly ? true : false
    return (
        <Rating
            name={ratingName}
            value={value}
            onChange={onChange}
            precision={ratingPrecision}
            size={ratingSize}
            max={ratingMax}
            disabled={isDisabled}
            readOnly={isReadOnly}>
        </Rating>
    );
};

export default RatingMui;