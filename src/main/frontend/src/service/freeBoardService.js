import http from "../http-common";

const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const FreeBoardService = {
    // ── 조회 ──────────────────────────────────────────────────────
    getLists:        async (params)   => (await http.get("/freeboard/list", { params })).data,
    getFreeBoard:    async (boardId)  => (await http.get(`/freeboard/article/${boardId}`)).data,
    getNav:          async (boardId)  => (await http.get(`/freeboard/article/${boardId}/nav`)).data,

    // ── 작성 / 수정 / 삭제 ────────────────────────────────────────
    insertFreeBoard: async (dto)      => http.post("/freeboard/write",        dto,        authHeader()),
    updateFreeBoard: async (dto)      => http.put("/freeboard/update",        dto,        authHeader()),
    deleteFreeBoard: async (boardId)  => http.delete(`/freeboard/delete/${boardId}`,      authHeader()),
    deleteMulti:     async (boardIds) => (await http.post("/freeboard/delete-multi", { boardIds }, authHeader())).data,

    // ── 좋아요 ────────────────────────────────────────────────────
    likeFreeBoard:   async (boardId)  => (await http.put(`/freeboard/like/${boardId}`, {}, authHeader())).data,
};

export default FreeBoardService;