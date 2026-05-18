import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
} from "@mui/material";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

import http from "../../http-common";
import { getLoginUser } from "./constants";
import SnackbarAlert from "../SnackbarAlert";

const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const REPORT_REASONS = [
    "스팸/광고",
    "음란성/선정성",
    "욕설/혐오 표현",
    "허위 사실 / 명예훼손",
    "도배/관련 없는 내용",
    "기타",
];

/**
 * 게시글/댓글 신고 버튼
 * - 수정내용: 전송 시 로그인한 유저의 ID(userId)를 포함함
 */
const FreeBoardReportButton = ({
    targetType, // "post" | "comment"
    targetId,
    size = "small",
    label = "신고",
    onSubmitted,
}) => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [detail, setDetail] = useState("");
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const showSnack = (message, severity = "success") =>
        setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const handleSubmit = async () => {
        if (!targetId) return;

        const loginUser = getLoginUser();
        if (!loginUser) {
            showSnack("로그인이 필요한 서비스입니다.", "warning");
            return;
        }

        setLoading(true);
        try {
            const url =
                targetType === "post"
                    ? `/freeboard/report/post/${targetId}`
                    : `/freeboard/report/comment/${targetId}`;

            // Authorization 헤더 포함하여 전송
            const res = await http.post(
                url,
                { reason, detail, userId: loginUser.id },
                authHeader()
            );

            const data = res?.data || {};

            if (data.status === "DUPLICATE") {
                showSnack("이미 신고하신 항목입니다.", "warning");
                setOpen(false);
                return;
            }
            if (data.status === "UNAUTHORIZED") {
                showSnack("로그인 세션이 만료되었거나 권한이 없습니다.", "error");
                return;
            }

            const count = data.count ?? 0;
            const threshold = data.threshold ?? 0;

            if (data.autoHidden) {
                showSnack(`신고 접수 완료 — 누적 ${count}회로 자동 숨김 처리되었습니다.`, "success");
            } else {
                showSnack(
                    `신고가 접수되었습니다. (누적 ${count}회${threshold ? ` / 임계값 ${threshold}회` : ""})`,
                    "success"
                );
            }

            setOpen(false);
            setDetail("");
            if (onSubmitted) onSubmitted();

        } catch (e) {
            const status = e?.response?.status;
            const body = e?.response?.data;

            if (status === 409 || body?.status === "DUPLICATE") {
                showSnack("이미 신고한 항목입니다.", "warning");
                setOpen(false);
                return;
            }
            if (status === 401) {
                showSnack("로그인이 필요합니다.", "warning");
                return;
            }
            showSnack("신고 처리 중 오류가 발생했습니다.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                size={size}
                color="warning"
                startIcon={<ReportGmailerrorredIcon fontSize="inherit" />}
                onClick={() => setOpen(true)}
            >
                {label}
            </Button>

            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
            />

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {targetType === "post" ? "게시글 신고" : "댓글 신고"}
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        select
                        label="신고 사유"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2, mt: 1 }}
                    >
                        {REPORT_REASONS.map((r) => (
                            <MenuItem key={r} value={r}>
                                {r}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="추가 설명 (선택)"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        size="small"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)} disabled={loading} color="inherit">
                        취소
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="warning"
                        variant="contained"
                        disabled={loading}
                    >
                        신고하기
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FreeBoardReportButton;