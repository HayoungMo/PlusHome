import React from "react";
import { useNavigate } from "react-router-dom";
import FreeBoardWriteMui from "../components/FreeBoardWriteMui";
import FreeBoardService from "../service/freeBoardService";
import { getLoginUser, GUEST_ID, GUEST_NAME } from "../components/freeboard/constants";

const FreeBoardWritePage = () => {
    const navigate = useNavigate();
    const loginUser = getLoginUser();

    const handleSave = async (data) => {
      console.log("현재 로그인 유저 타입:", loginUser?.type);

       
        const boardWithUser = {
            ...data,
            userId: loginUser?.id || GUEST_ID,
            userName: loginUser?.name || GUEST_NAME,
        };

        try {
            await FreeBoardService.insertFreeBoard(boardWithUser);
            alert("게시글이 등록되었습니다.");
            navigate("/freeboard/list");
        } catch (error) {
            console.error("자유게시판 등록 실패:", error);
            const status = error?.response?.status;
            const msg    = error?.response?.data;
            if (status === 403) {
                alert(typeof msg === "string" ? msg : "해당 카테고리에 작성 권한이 없습니다.");
            } else if (status === 401) {
                alert("로그인이 필요합니다.");
            } else {
                alert("게시글 등록에 실패했습니다.");
            }
        }
    };

    return (
    <div>
        
        <FreeBoardWriteMui
            onSave={handleSave}
            onCancel={() => navigate("/freeboard/list")}
            userType={loginUser?.type || "guest"}
        />
    </div>
    );
};

export default FreeBoardWritePage;