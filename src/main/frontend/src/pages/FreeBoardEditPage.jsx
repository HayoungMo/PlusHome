import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FreeBoardWriteMui from "../components/FreeBoardWriteMui";
import FreeBoardService from "../service/freeBoardService";

// 관리자 권한 타입 (USERS.TYPE = 'admin' 인 계정은 모든 권한)
const ADMIN_TYPE = "admin";

const FreeBoardEditPage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);

    // loginUser를 useMemo로 고정 (핵심 수정 포인트)
    const loginUser = useMemo(() => {
        try {
            const user = localStorage.getItem("user");
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        const fetchAndCheckAuth = async () => {
            try {
                // 1. 게시글 상세 데이터 호출
                const data = await FreeBoardService.getFreeBoard(boardId);

                if (!data) {
                    alert("존재하지 않는 게시글입니다.");
                    navigate("/freeboard/list");
                    return;
                }

                // 2. 비로그인 상태 차단
                if (!loginUser) {
                    alert("로그인이 필요합니다.");
                    navigate(`/freeboard/article/${boardId}`);
                    return;
                }

                // 3. 권한 체크
                const isAdmin = loginUser.type === ADMIN_TYPE;
                const isAuthor = String(data.userId) === String(loginUser.id);

                if (!isAdmin && !isAuthor) {
                    alert("수정 권한이 없습니다. 작성자 본인만 가능합니다.");
                    navigate(`/freeboard/article/${boardId}`);
                    return;
                }

                // 4. 데이터 세팅
                setInitialData(data);

            } catch (error) {
                console.error("데이터 로드 실패:", error);
                alert("게시글을 불러오는 중 오류가 발생했습니다.");
                navigate("/freeboard/list");
            }
        };

        fetchAndCheckAuth();
    }, [boardId, navigate, loginUser]);  

    // 5. 수정 처리 함수
    const handleUpdate = async (updatedData) => {
        try {
            await FreeBoardService.updateFreeBoard({
                ...updatedData,
                boardId: Number(boardId),
            });

            alert("수정되었습니다.");
            navigate(`/freeboard/article/${boardId}`);
        } catch (error) {
            console.error("수정 실패:", error);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    // 6. 로딩 처리
    if (!initialData) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                데이터 로딩 중...
            </div>
        );
    }

    return (
        <FreeBoardWriteMui
            initialData={initialData}
            onSave={handleUpdate}
            onCancel={() => navigate(`/freeboard/article/${boardId}`)}
        />
    );
};

export default FreeBoardEditPage;