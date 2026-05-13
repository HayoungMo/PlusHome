import http from "../http-common";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const FreeBoardCommentService = {

    // 1. 댓글 목록 조회
    getComments: async (boardId, userType = "guest") => {
        const response = await http.get(`freeboard/comments/${boardId}`, {
            params: { type: userType },
        });
        return response.data;
    },

    // 2. 댓글 등록
    writeComment: async (commentData) => {
        const response = await http.post("/freeboard/comments/write", commentData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // 3. 댓글 수정
    updateComment: async (commentData) => {
        const response = await http.put("/freeboard/comments/update", commentData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // 4. 댓글 삭제
    deleteComment: async (boardId, commentId) => {
        const response = await http.delete(`/freeboard/comments/${boardId}/${commentId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
};

export default FreeBoardCommentService;