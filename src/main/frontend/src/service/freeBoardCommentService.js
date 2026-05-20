import http from "../http-common";

const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const FreeBoardCommentService = {

    // 1. 댓글 목록 조회 (인증 불필요)
    getComments: async (boardId, userType = "guest") =>
        (await http.get(`/freeboard/comments/${boardId}`, { params: { type: userType } })).data,

    // 2. 댓글 등록
    writeComment: async (commentData) =>
        (await http.post("/freeboard/comments/write", commentData, authHeader())).data,

    // 3. 댓글 수정
    updateComment: async (commentData) =>
        (await http.put("/freeboard/comments/update", commentData, authHeader())).data,

    // 4. 댓글 삭제
    deleteComment: async (boardId, commentId) =>
        (await http.delete(`/freeboard/comments/${boardId}/${commentId}`, authHeader())).data,
};

export default FreeBoardCommentService;

