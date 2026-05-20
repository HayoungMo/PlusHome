import React from "react";
import { Box, TextField } from "@mui/material";

/**
 * TextField 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.label 라벨
 * @param {state} props.value 표시할 값
 * @param {function} props.onChange 변경 이벤트
 * @param {string} props.name id 및 document name 에 사용될 이름 ( 기본 textFieldMui )
 * @param {boolean} props.disabled 비활성화 여부 ( 기본 false )
 * @param {function} props.onKeyDown 키보드 입력 이벤트
 * @param {boolean} props.required 필수 여부 ( 기본 false )
 * @param {boolean} props.error 에러 표시 여부 ( 기본 false )
 * @param {string} props.helperText 도움말
 * @param {boolean} props.multiline 여러 줄 입력 ( 기본 false )
 * @param {string} props.type input type
 * @param {string} props.variant 텍스트 필드 바리에이션 ( MUI 참조, 기본 outlined )
 * @param {string} props.width 텍스트 필드 넓이 ( 기본 200px )
 * @param {number} props.rows 줄 개수 ( multiline true 필수 )
 * @param {number} props.minRows 최소 줄 개수 ( multiline true 필수 )
 * @param {number} props.maxRows 최대 줄 개수 ( multiline true 필수 )
 *
 */
const TextFieldMui = (props) => {
	const {
		label,
		value,
		onChange,
		name = "textFieldMui",
		disabled = false,
		onKeyDown,
		required = false,
		error = false,
		helperText,
		multiline = false,
		type,
		variant = "outlined",
		width,
		rows,
		minRows,
		maxRows,
	} = props;

	return (
		<Box sx={{ width: width ? width : "200px" }} className={`${name}__${label}__${width}`}>
			<TextField
				name={name}
				label={label}
				value={value}
				disabled={disabled}
				onChange={onChange}
				onKeyDown={onKeyDown}
				helperText={helperText}
				type={type}
				variant={variant}
				required={required}
				error={error}
				multiline={multiline}
				rows={rows}
				minRows={minRows}
				maxRows={maxRows}
				fullWidth></TextField>
		</Box>
	);
};

export default TextFieldMui;
