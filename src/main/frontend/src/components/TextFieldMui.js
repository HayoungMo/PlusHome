import React from "react";
import { Box, TextField } from "@mui/material";

const TextFieldMui = (props) => {
	const {
		label,
		value,
		onChange,
		name,
		disabled,
		onKeyDown,
		required,
		error,
		helperText,
		multiline,
		type,
		variant,
		width,
		rows,
		minRows,
		maxRows,
	} = props;

	const textVariant = variant ? variant : "outlined";
	const isDisabled = disabled ? true : false;
	const isRequired = required ? true : false;
	const isError = error ? true : false;
	const isMultiline = multiline ? true : false;

	return (
		<Box sx={{ width: width ? width : "200px" }} className={`${name}__${label}__${width}`}>
			<TextField
				name={name}
				label={label}
				value={value}
				disabled={isDisabled}
				onChange={onChange}
				onKeyDown={onKeyDown}
				helperText={helperText}
				type={type}
				variant={textVariant}
				required={isRequired}
				error={isError}
				multiline={isMultiline}
				rows={rows}
				minRows={minRows}
				maxRows={maxRows}
				fullWidth></TextField>
		</Box>
	);
};

export default TextFieldMui;
