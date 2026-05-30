import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";

/**
 * 공통 확인 Dialog 컴포넌트
 *
 * 저장, 삭제, 수정 등 사용자의 최종 확인이 필요한 상황에서 사용하는 MUI 기반 Dialog 컴포넌트입니다.
 * 확인 버튼과 취소 버튼을 제공하며, 버튼 문구와 확인 버튼 색상을 props로 변경할 수 있습니다.
 *
 * @param {Object} props
 * @param {boolean} props.open Dialog 표시 여부
 * @param {string} props.title Dialog 상단에 표시할 제목
 * @param {string | React.ReactNode} props.message Dialog 본문에 표시할 메시지
 * @param {string} [props.confirmLabel="저장"] 확인 버튼에 표시할 텍스트
 * @param {string} [props.cancelLabel="취소"] 취소 버튼에 표시할 텍스트
 * @param {"primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit"} [props.confirmColor="primary"] 확인 버튼 색상
 * @param {Function} props.onConfirm 확인 버튼 클릭 시 실행할 함수
 * @param {Function} props.onClose Dialog 닫기 또는 취소 버튼 클릭 시 실행할 함수
 *
 * @returns {JSX.Element} 확인/취소 버튼이 포함된 Dialog UI
 */
const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = "저장",
    cancelLabel = "취소",
    confirmColor = "primary",
    onConfirm,
    onClose,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
                {cancelLabel}
            </Button>
            <Button variant="outlined" color={confirmColor} onClick={onConfirm} autoFocus>
                {confirmLabel}
            </Button>
        </DialogActions>
    </Dialog>
);

export default ConfirmDialog;
