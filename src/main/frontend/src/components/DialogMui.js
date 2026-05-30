import React from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

/**
 * 공통 Dialog 컴포넌트
 *
 * MUI Dialog를 기반으로 만든 공통 모달 컴포넌트입니다.
 * 제목, 본문 텍스트, 버튼 목록을 props로 전달받아 표시합니다.
 * 바깥 영역 클릭(backdropClick)이나 ESC 키 입력으로는 닫히지 않으며,
 * 버튼 클릭 등 명시적인 동작을 통해서만 닫히도록 구성되어 있습니다.
 *
 * @param {Object} props
 * @param {boolean} props.open Dialog 표시 여부
 * @param {Function} props.onClose Dialog 닫기 시 실행할 함수
 * @param {string} props.title Dialog 상단에 표시할 제목
 * @param {string | React.ReactNode} props.text Dialog 본문에 표시할 내용
 * @param {Object[]} [props.buttons=[]] Dialog 하단에 표시할 버튼 목록
 * @param {string} props.buttons[].title 버튼에 표시할 텍스트
 * @param {Function} props.buttons[].onClick 버튼 클릭 시 실행할 함수
 * @param {"primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit"} [props.buttons[].color="primary"] 버튼 색상
 * @param {"text" | "outlined" | "contained"} [props.buttons[].variant="text"] 버튼 형태
 * @param {boolean} [props.buttons[].disabled=false] 버튼 비활성화 여부
 * @param {"xs" | "sm" | "md" | "lg" | "xl" | false} [props.maxWidth="sm"] Dialog 최대 너비
 * @param {boolean} [props.fullWidth=false] Dialog 너비를 maxWidth 기준으로 가득 채울지 여부
 *
 * @returns {JSX.Element} 공통 Dialog UI
 */
const DialogMui = (props) => {
	const { open, onClose, title, text, buttons = [], maxWidth = "sm", fullWidth = false } = props;

	const handleClose = (event, reason) => {
		if (reason === "backdropClick") {
			return;
		}

		if (reason === "escapeKeyDown") {
			return;
		}

		onClose?.();
	};

	return (
		<Dialog onClose={handleClose} open={open} maxWidth={maxWidth} fullWidth={fullWidth}>
			{title && <DialogTitle>{title}</DialogTitle>}

			<DialogContent>
				<DialogContentText>{text}</DialogContentText>
			</DialogContent>

			<DialogActions>
				{buttons?.map((button) => (
					<Button
						key={button.title}
						onClick={button.onClick}
						color={button.color || "primary"}
						variant={button.variant || "text"}
						disabled={button.disabled}>
						{button.title}
					</Button>
				))}
			</DialogActions>
		</Dialog>
	);
};

export default DialogMui;
