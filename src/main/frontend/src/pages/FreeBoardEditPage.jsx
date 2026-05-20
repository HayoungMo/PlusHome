import React, { useEffect, useState, useMemo } from "react";
import "../css/FreeBoardWritePage.css";
import { useNavigate, useParams } from "react-router-dom";
import FreeBoardWriteMui from "../components/FreeBoardWriteMui";
import FreeBoardService from "../service/freeBoardService";
import { getLoginUser, isAdminUser } from "../components/freeboard/constants";
import SnackbarAlert from "../components/SnackbarAlert";
import Loading from "../components/Loading";

const FreeBoardEditPage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const currentBoardId = Number(boardId);
    const [initialData, setInitialData] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const loginUser = useMemo(() => getLoginUser(), []);

    const showSnack = (message, severity = "success") =>
        setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    useEffect(() => {
        const fetchAndCheckAuth = async () => {
            try {
                const data = await FreeBoardService.getFreeBoard(boardId);

                if (!data) {
                    showSnack("존재하지 않는 게시글입니다.", "error");
                    setTimeout(() => navigate("/freeboard/list"), 1000);
                    return;
                }
                if (!loginUser) {
                    showSnack("로그인이 필요합니다.", "warning");
                    setTimeout(() => navigate(`/freeboard/article/${boardId}`), 1000);
                    return;
                }

                const isAdmin  = isAdminUser(loginUser);
                const isAuthor = String(data.userId) === String(loginUser.id);

                if (!isAdmin && !isAuthor) {
                    showSnack("수정 권한이 없습니다. 작성자 본인만 가능합니다.", "error");
                    setTimeout(() => navigate(`/freeboard/article/${boardId}`), 1000);
                    return;
                }

                setInitialData(data);
            } catch {
                showSnack("게시글을 불러오는 중 오류가 발생했습니다.", "error");
                setTimeout(() => navigate("/freeboard/list"), 1000);
            }
        };

        fetchAndCheckAuth();
    }, [boardId, navigate, loginUser]);

    const handleUpdate = async (updatedData) => {
        try {
            await FreeBoardService.updateFreeBoard({ ...updatedData, boardId: currentBoardId });
            showSnack("수정되었습니다.", "success");
            setTimeout(() => navigate(`/freeboard/article/${boardId}`), 1000);
        } catch {
            showSnack("수정 중 오류가 발생했습니다.", "error");
        }
    };

    if (!initialData) {
        return (
            <>
                <Loading type="skeleton" message="데이터를 불러오는 중 입니다."/>
                <SnackbarAlert
                    open={snack.open}
                    message={snack.message}
                    severity={snack.severity}
                    onClose={closeSnack}
                />
            </>
        );
    }

    return (
        <>
            <FreeBoardWriteMui
                initialData={initialData}
                onSave={handleUpdate}
                onCancel={() => navigate(`/freeboard/article/${boardId}`)}
                userType={loginUser?.type || "user"}
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

export default FreeBoardEditPage;
