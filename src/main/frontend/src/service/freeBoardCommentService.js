import http from "../http-common";
import authHeader from "./authHeader";

const FreeBoardCommentService = {
    getComments:   (boardId, userType = "guest") =>
        http.get(`/freeboard/comments/${boardId}`, { params: { type: userType } }).then(r => r.data),
    writeComment:  (data)                => http.post("/freeboard/comments/write",  data, authHeader()).then(r => r.data),
    updateComment: (data)                => http.put("/freeboard/comments/update",  data, authHeader()).then(r => r.data),
    deleteComment: (boardId, commentId)  => http.delete(`/freeboard/comments/${boardId}/${commentId}`, authHeader()).then(r => r.data),
};

export default FreeBoardCommentService;
