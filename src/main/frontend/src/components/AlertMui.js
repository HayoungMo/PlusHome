import React, { useEffect } from "react";
import { Alert, AlertTitle } from "@mui/material";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

const AlertMui = (props) => {
	const { severity, variant, title, text, onClose, icon, autoHideDuration } = props;

	const alertSeverity = severity ? severity : "info";
	const alertVariant = variant ? variant : "standard";

	const getIcon = (icon) => {
		switch (alertSeverity) {
			case "success":
				return <TaskAltOutlinedIcon />;
			case "info":
				return <InfoOutlinedIcon />;
			case "warning":
				return <WarningAmberOutlinedIcon />;
			case "error":
				return <ErrorOutlineOutlinedIcon />;
			default:
				return <InfoOutlinedIcon />;
		}
	};

	useEffect(() => {
		if (autoHideDuration && onClose) {
			const timer = setTimeout(() => {
				onClose();
			}, autoHideDuration);

			return () => clearTimeout(timer); // 컴포넌트가 사라질 때 타이머 청소
		}
	}, [autoHideDuration, onClose]);

	return (
		<Alert
			severity={alertSeverity}
			variant={alertVariant}
			onClose={onClose}
			icon={getIcon(icon)}>
			{title && <AlertTitle>{title}</AlertTitle>}
			{text}
		</Alert>
	);
};

export default AlertMui;
