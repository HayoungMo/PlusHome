import http from "../http-common";
import authHeader from "./authHeader";

const FreeBoardService = {
    // 조회
    getLists:        (params)   => http.get("/freeboard/list", { params }).then(r => r.data),
    getFreeBoard:    (boardId)  => http.get(`/freeboard/article/${boardId}`).then(r => r.data),
    incrementView:   (boardId)  => http.put(`/freeboard/article/${boardId}/view`),
    getNav:          (boardId)  => http.get(`/freeboard/article/${boardId}/nav`).then(r => r.data),

    // 작성 / 수정 / 삭제
    insertFreeBoard: (dto)      => http.post("/freeboard/write",           dto, authHeader()),
    updateFreeBoard: (dto)      => http.put("/freeboard/update",            dto, authHeader()),
    deleteFreeBoard: (boardId)  => http.delete(`/freeboard/delete/${boardId}`, authHeader()),
    deleteMulti:     (boardIds) => http.post("/freeboard/delete-multi", { boardIds }, authHeader()).then(r => r.data),

    // 좋아요
    checkLike:       (boardId)  => http.get(`/freeboard/like/${boardId}/check`, authHeader()).then(r => r.data),
    likeFreeBoard:   (boardId)  => http.put(`/freeboard/like/${boardId}`,    {}, authHeader()).then(r => r.data),
    unlikeFreeBoard: (boardId)  => http.put(`/freeboard/unlike/${boardId}`,  {}, authHeader()).then(r => r.data),

    // 신고 / 취소
    reportPost:        (boardId, reason)   => http.post(`/freeboard/report/post/${boardId}`,      { reason }, authHeader()).then(r => r.data),
    cancelPostReport:  (boardId)           => http.delete(`/freeboard/report/post/${boardId}`,                authHeader()).then(r => r.data),
    reportComment:     (commentId, reason) => http.post(`/freeboard/report/comment/${commentId}`, { reason }, authHeader()).then(r => r.data),
    cancelCommentReport: (commentId)       => http.delete(`/freeboard/report/comment/${commentId}`,           authHeader()).then(r => r.data),
};

export default FreeBoardService;
