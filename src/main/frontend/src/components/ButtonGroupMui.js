import React from "react";
import { Button, ButtonGroup } from "@mui/material";

const ButtonGroupMui = (props) => {
	const {
		disabled,
		button = [],
		variant = "contained",
		size,
		color,
		orientation = "horizontal",
	} = props;

	const isDisabled = disabled ? true : false;

	return (
		<div>
			<ButtonGroup
				size={size}
				color={color}
				variant={variant}
				orientation={orientation}
				disabled={isDisabled}>
				{button?.map((record) => {
					return (
						<Button key={record.title} onClick={record.onClick}>
							{record.title}
						</Button>
					);
				})}
			</ButtonGroup>
		</div>
	);
};

export default ButtonGroupMui;
