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

    const handleSubmit = async () => {
        if (!targetId) return;

        // 1. 로그인 유저 정보 가져오기 (모듈 공통 유틸 사용 — 서버에서 reporterId 필수)
        const loginUser = getLoginUser();
        if (!loginUser) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }

        setLoading(true);
        try {
            const url =
                targetType === "post"
                    ? `/freeboard/report/post/${targetId}`
                    : `/freeboard/report/comment/${targetId}`;

            // 2. 서버로 보낼 때 userId를 같이 실어 보냄
            const res = await http.post(url, { 
                reason, 
                detail, 
                userId: loginUser.id // 서버의 reporterId로 매핑됨
            });

            const data = res?.data || {};

            // 3. 서버 응답 상태에 따른 분기 처리
            if (data.status === "DUPLICATE") {
                alert("이미 신고하신 항목입니다.");
                setOpen(false);
                return;
            }

            if (data.status === "UNAUTHORIZED") {
                alert("로그인 세션이 만료되었거나 권한이 없습니다.");
                return;
            }

            const count = data.count ?? 0;
            const threshold = data.threshold ?? 0;

            if (data.autoHidden) {
                alert(
                    `신고가 접수되었습니다.\n누적 ${count}회 신고로 자동 숨김 처리되었습니다.`
                );
            } else {
                alert(
                    `신고가 접수되었습니다. (누적 ${count}회${
                        threshold ? ` / 임계값 ${threshold}회` : ""
                    })`
                );
            }

            setOpen(false);
            setDetail(""); // 입력창 초기화
            if (onSubmitted) onSubmitted();

        } catch (e) {
            const status = e?.response?.status;
            const body = e?.response?.data;

            if (status === 409 || body?.status === "DUPLICATE") {
                alert("이미 신고한 항목입니다.");
                setOpen(false);
                return;
            }
            if (status === 401) {
                alert("로그인이 필요합니다.");
                return;
            }
            console.warn("신고 API 호출 실패:", status, body);
            alert(
                "신고 처리 중 오류가 발생했습니다. (DB 연결이나 테이블 상태를 확인해주세요)"
            );
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