import React, { useEffect, useState } from "react";
import "../css/FreeBoardWritePage.css";
import { useNavigate } from "react-router-dom";
import FreeBoardWriteMui from "../components/FreeBoardWriteMui";
import FreeBoardService from "../service/freeBoardService";
import { getLoginUser } from "../components/freeboard/constants";
import SnackbarAlert from "../components/SnackbarAlert";

const FreeBoardWritePage = () => {
    const navigate = useNavigate();
    const loginUser = getLoginUser();

    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const showSnack = (message, severity = "success") =>
        setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    // 비로그인 접근 차단 → 로그인 페이지로
    useEffect(() => {
        if (!loginUser) {
            navigate("/login", { replace: true });
        }
    }, [loginUser, navigate]);

    if (!loginUser) return null;

    const handleSave = async (data) => {
        const boardWithUser = {
            ...data,
            userId:   loginUser.id,
            userName: loginUser.name,
        };

        try {
            await FreeBoardService.insertFreeBoard(boardWithUser);
            showSnack("게시글이 등록되었습니다.", "success");
            setTimeout(() => navigate("/freeboard/list"), 1000);
        } catch (error) {
            const status = error?.response?.status;
            const msg    = error?.response?.data;
            if (status === 403) {
                showSnack(typeof msg === "string" ? msg : "해당 카테고리에 작성 권한이 없습니다.", "error");
            } else if (status === 401) {
                showSnack("로그인이 필요합니다.", "warning");
                setTimeout(() => navigate("/login"), 1000);
            } else {
                showSnack("게시글 등록에 실패했습니다.", "error");
            }
        }
    };

    return (
        <>
            <FreeBoardWriteMui
                onSave={handleSave}
                onCancel={() => navigate("/freeboard/list")}
                userType={loginUser.type}
            />

            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
            />
        </>
    );
};

export default FreeBoardWritePage;
