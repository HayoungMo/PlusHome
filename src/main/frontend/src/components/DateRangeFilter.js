import React from "react";
import { Button } from "@mui/material";
import DatePickerMui from "./DatePickerMui";

/**
 * 날짜 범위 필터 컴포넌트
 *
 * 시작일과 종료일을 선택할 수 있는 공통 날짜 범위 필터 컴포넌트입니다.
 * DatePickerMui를 사용하여 날짜를 선택하고,
 * 선택된 날짜는 "YYYY-MM-DD" 형식의 문자열로 변환되어 onChange로 전달됩니다.
 * 기간 초기화 버튼을 통해 시작일과 종료일을 모두 비울 수 있으며,
 * 유효하지 않은 기간일 경우 에러 메시지를 표시할 수 있습니다.
 *
 * @param {Object} props
 * @param {{ startDate: string, endDate: string }} [props.value={ startDate: "", endDate: "" }] 현재 선택된 시작일과 종료일 값
 * @param {Function} props.onChange 날짜 범위 변경 시 실행할 함수
 * @param {boolean} [props.isInvalid=false] 날짜 범위 유효성 오류 여부
 * @param {string} [props.startLabel="시작일"] 시작일 DatePicker에 표시할 라벨
 * @param {string} [props.endLabel="종료일"] 종료일 DatePicker에 표시할 라벨
 * @param {string} [props.resetLabel="기간 초기화"] 초기화 버튼에 표시할 텍스트
 * @param {string} [props.errorText="기간을 다시 선택해주세요."] 유효성 오류 시 표시할 메시지
 * @param {string} [props.className=""] 최상위 div에 추가로 적용할 className
 *
 * @returns {JSX.Element} 시작일, 종료일, 초기화 버튼이 포함된 날짜 범위 필터 UI
 */
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
