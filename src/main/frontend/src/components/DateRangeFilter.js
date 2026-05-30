import React from "react";
import { Button } from "@mui/material";
import DatePickerMui from "./DatePickerMui";

const DateRangeFilter = (props) => {
	const {
		value = { startDate: "", endDate: "" },
		onChange,
		isInvalid = false,
		startLabel = "시작일",
		endLabel = "종료일",
		resetLabel = "기간 초기화",
		errorText = "기간을 다시 선택해주세요.",
		className = "",
	} = props;

	const handleChange = (name, nextValue) => {
		if (!onChange) return;

		onChange({
			...value,
			[name]: nextValue && nextValue.isValid() ? nextValue.format("YYYY-MM-DD") : "",
		});
	};

	const handleReset = () => {
		if (!onChange) return;

		onChange({ startDate: "", endDate: "" });
	};

	return (
		<div className={`shopping-mall-date-range-wrap ${className}`.trim()}>
			<div className="shopping-mall-date-range-filter">
				<DatePickerMui
					label={startLabel}
					value={value.startDate}
					onChange={(nextValue) => handleChange("startDate", nextValue)}
					slotProps={{ textField: { size: "small" } }}
				/>
				<span>~</span>
				<DatePickerMui
					label={endLabel}
					value={value.endDate}
					onChange={(nextValue) => handleChange("endDate", nextValue)}
					slotProps={{ textField: { size: "small" } }}
				/>
				<Button
					variant="text"
					color="inherit"
					disabled={!value.startDate && !value.endDate}
					onClick={handleReset}>
					{resetLabel}
				</Button>
			</div>
			{isInvalid && <div className="shopping-mall-date-range-error">{errorText}</div>}
		</div>
	);
};

export default DateRangeFilter;
