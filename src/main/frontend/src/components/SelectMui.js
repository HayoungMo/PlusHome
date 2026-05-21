import React from "react";
import { Select, FormControl, InputLabel, FormHelperText, MenuItem } from "@mui/material";

/**
 * Select 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.label 라벨
 * @param {state} props.value 표시할 값
 * @param {function} props.onChange 변경 이벤트
 * @param {object[]} props.option Select 목록, {title:'보일 값',value:'실제 값'} 을 배열로. ( 기본 [] )
 * @param {string} props.name id 및 document name 에 사용될 이름 ( 기본 selectMui )
 * @param {boolean} props.required 필수 여부 ( 기본 false )
 * @param {string} props.width 넓이 ( 기본 200px )
 *
 */
const SelectMui = (props) => {
	const {
		label,
		value,
		onChange,
		option = [],
		name = "selectMui",
		required = false,
		width,
	} = props;
	const selectId = `select-${name}`;
	const labelId = `select-label-${name}`;
	const selectValue = value ?? "";

	return (
		<div style={{ width: width ? width : "200px", display: "flex", flexDirection: "column" }}>
			<FormControl>
				{label && <InputLabel id={labelId}>{label}</InputLabel>}
				<Select
					labelId={label ? labelId : undefined}
					name={name}
					id={selectId}
					onChange={onChange}
					value={selectValue}
					label={label}>
					{option?.map((item) => (
						<MenuItem key={`${name}-${item.value}`} value={item.value}>
							{item.title}
						</MenuItem>
					))}
				</Select>
				{required && <FormHelperText>Required</FormHelperText>}
			</FormControl>
		</div>
	);
};

export default SelectMui;
