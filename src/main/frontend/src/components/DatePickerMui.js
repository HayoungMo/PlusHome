import React from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

/**
 * DatePickerMui 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.label 라벨
 * @param {state} props.value 표시할 값
 * @param {function} props.onChange 변경 이벤트
 *
 */
const DatePickerMui = (props) => {
	const { value, onChange, label } = props;

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<DatePicker
				label={label ? label : "날짜 선택"}
				format="YYYY-MM-DD"
				value={value ? dayjs(value) : null}
				onChange={onChange}
			/>
		</LocalizationProvider>
	);
};

export default DatePickerMui;
