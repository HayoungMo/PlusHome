import http from "../http-common";

const FreeBoardService = {
    // 목록 조회
    getLists: async (params) => {
        const response = await http.get("/freeboard/list", { params });
        return response.data;
    },

    // 상세 조회 (조회수 증가 포함)
    getFreeBoard: async (boardId) => {
        const response = await http.get(`/freeboard/article/${boardId}`);
        return response.data;
    },

    // 이전글 / 다음글 조회
    getNav: async (boardId) => {
        const response = await http.get(`/freeboard/article/${boardId}/nav`);
        return response.data;
    },

    // 게시글 작성
    insertFreeBoard: async (dto) => {
        return await http.post("/freeboard/write", dto);
    },

    // 게시글 수정
    updateFreeBoard: async (dto) => {
        return await http.put("/freeboard/update", dto);
    },

    // 게시글 삭제
    deleteFreeBoard: async (boardId) => {
        return await http.delete(`/freeboard/delete/${boardId}`);
    },

    // 게시글 다중 삭제 (본인 글만 삭제됨)
    deleteMulti: async (boardIds) => {
        const response = await http.post("/freeboard/delete-multi", { boardIds });
        return response.data;
    },

    // 좋아요 (likeCount 증가)
    likeFreeBoard: async (boardId) => {
        const response = await http.put(`/freeboard/like/${boardId}`);
        return response.data;
    }
};

export default FreeBoardService;
