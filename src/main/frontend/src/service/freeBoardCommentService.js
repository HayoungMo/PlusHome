import http from "../http-common";

const FreeBoardCommentService = {
    // 댓글 목록 조회
    getComments: async (boardId) => {
        const response = await http.get(`/freeboard/comments/${boardId}`);
        return response.data;
    },

    // 댓글 등록 (parentId가 있으면 대댓글)
    writeComment: async (commentData) => {
        const response = await http.post("/freeboard/comments/write", commentData);
        return response.data;
    },

    // 댓글 수정
    updateComment: async (commentData) => {
        const response = await http.put("/freeboard/comments/update", commentData);
        return response.data;
    },

    // 댓글 삭제
    deleteComment: async (boardId, commentId) => {
        const response = await http.delete(`/freeboard/comments/${boardId}/${commentId}`);
        return response.data;
    }
};

export default FreeBoardCommentService;
