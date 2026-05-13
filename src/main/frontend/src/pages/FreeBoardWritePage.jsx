import React from "react";
import { useNavigate } from "react-router-dom";
import FreeBoardWriteMui from "../components/FreeBoardWriteMui";
import FreeBoardService from "../service/freeBoardService";
import { getLoginUser, GUEST_ID, GUEST_NAME } from "../components/freeboard/constants";

const FreeBoardWritePage = () => {
    const navigate = useNavigate();
    const loginUser = getLoginUser();

    const handleSave = async (data) => {
      

       
        const boardWithUser = {
            ...data,
            userId: loginUser?.id || GUEST_ID,
            userName: loginUser?.name || GUEST_NAME,
        };

        try {
            console.log("최종 전송 데이터:", boardWithUser);
            await FreeBoardService.insertFreeBoard(boardWithUser);

            alert("게시글이 등록되었습니다.");
            navigate("/freeboard/list");
        } catch (error) {
            console.error("자유게시판 등록 실패:", error);
            alert("게시글 등록에 실패했습니다.");
        }
    };

    return (
    <div>
        <FreeBoardWriteMui
            onSave={handleSave}
            onCancel={() => navigate("/freeboard/list")}
            isAdmin={loginUser?.type === "admin"}
        />
    </div>
    );
};

export default FreeBoardWritePage;