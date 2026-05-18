import http from "../http-common";

/**
 * 토큰이 있을 때만 Authorization 헤더를 첨부한다.
 * (없을 때 'Bearer null' 을 보내면 백엔드 JWT 파싱이 예외에 의존하게 됨)
 */
const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const FreeBoardService = {
    // ── 조회 ──────────────────────────────────────────────────────
    getLists:        async (params)   => (await http.get("/freeboard/list", { params })).data,
    getFreeBoard:    async (boardId)  => (await http.get(`/freeboard/article/${boardId}`)).data,
    incrementView:   async (boardId)  => http.put(`/freeboard/article/${boardId}/view`),
    getNav:          async (boardId)  => (await http.get(`/freeboard/article/${boardId}/nav`)).data,

    // ── 작성 / 수정 / 삭제 ────────────────────────────────────────
    insertFreeBoard: async (dto)      => http.post("/freeboard/write",        dto,        authHeader()),
    updateFreeBoard: async (dto)      => http.put("/freeboard/update",        dto,        authHeader()),
    deleteFreeBoard: async (boardId)  => http.delete(`/freeboard/delete/${boardId}`,      authHeader()),
    deleteMulti:     async (boardIds) => (await http.post("/freeboard/delete-multi", { boardIds }, authHeader())).data,

    // ── 좋아요 ────────────────────────────────────────────────────
    likeFreeBoard:   async (boardId)  => (await http.put(`/freeboard/like/${boardId}`,   {}, authHeader())).data,
    unlikeFreeBoard: async (boardId)  => (await http.put(`/freeboard/unlike/${boardId}`, {}, authHeader())).data,
};

export default FreeBoardService;