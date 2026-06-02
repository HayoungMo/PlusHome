import React, { useEffect } from "react";
import { Alert, AlertTitle, Portal } from "@mui/material";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

/**
 * 공통 Alert 컴포넌트
 *
 * MUI Alert를 기반으로 성공, 정보, 경고, 에러 메시지를 표시하는 컴포넌트입니다.
 * severity 값에 따라 아이콘이 자동으로 변경되며,
 * autoHideDuration 값을 전달하면 지정한 시간 후 onClose 함수가 실행됩니다.
 *
 * @param {Object} props
 * @param {"success" | "info" | "warning" | "error"} props.severity Alert의 상태 타입
 * @param {"standard" | "filled" | "outlined"} props.variant Alert의 디자인 형태
 * @param {string} props.title Alert 상단에 표시할 제목
 * @param {string | React.ReactNode} props.text Alert 본문에 표시할 내용
 * @param {Function} props.onClose Alert 닫기 버튼 클릭 또는 자동 종료 시 실행할 함수
 * @param {React.ReactNode} props.icon 사용자 지정 아이콘
 * @param {number} props.autoHideDuration Alert가 자동으로 닫히기까지의 시간(ms)
 *
 * @returns {JSX.Element} 상태 메시지를 표시하는 Alert UI
 */
const AlertMui = (props) => {
	const {
		severity,
		variant,
		title,
		text,
		onClose,
		icon,
		autoHideDuration,
		floating = true,
		zIndex = 10000,
	} = props;

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

	const alertElement = (
		<Alert
			severity={alertSeverity}
			variant={alertVariant}
			onClose={onClose}
			icon={getIcon(icon)}
			sx={{ minWidth: 280, maxWidth: "calc(100vw - 32px)", boxShadow: 3 }}>
			{title && <AlertTitle>{title}</AlertTitle>}
			{text}
		</Alert>
	);

	if (!floating) {
		return alertElement;
	}

	return (
		<Portal>
			<div
				style={{
					position: "fixed",
					top: 24,
					left: "50%",
					transform: "translateX(-50%)",
					zIndex,
					pointerEvents: "none",
				}}>
				<div style={{ pointerEvents: "auto" }}>{alertElement}</div>
			</div>
		</Portal>
	);
};

export default AlertMui;
