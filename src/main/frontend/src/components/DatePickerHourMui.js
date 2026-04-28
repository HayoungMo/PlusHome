import React from 'react';
import dayjs from 'dayjs';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const DatePickerHourMui = (props) => {
    const {value, onChange, label} = props

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                label={label? label : "날짜 및 시간 선택"}
                format='YYYY-MM-DD HH:mm'
                value={value? dayjs(value):null}
                onChange={onChange}
            />
        </LocalizationProvider>
    );
};

export default DatePickerHourMui;