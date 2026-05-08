import React from "react";
import { useNavigate } from "react-router-dom";
import FreeBoardWriteMui from "../components/FreeBoardWriteMui";
import FreeBoardService from "../service/freeBoardService";

const FreeBoardWritePage = () => {
    const navigate = useNavigate();

    const handleSave = async (data) => {
        try {
           
            await FreeBoardService.insertFreeBoard(data);

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
            />
        </div>
    );
};

export default FreeBoardWritePage;
