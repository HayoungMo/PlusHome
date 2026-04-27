import React from 'react';
import dayjs from 'dayjs';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DatePickerMui = (props) => {
    const {value, onChange, label} = props

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label={label? label : "날짜 선택"}
                format='YYYY-MM-DD'
                value={value? dayjs(value):null}
                onChange={onChange}
            />
        </LocalizationProvider>
    );
};

export default DatePickerMui;