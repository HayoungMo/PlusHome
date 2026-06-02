import http from "../http-common";
import authHeader from "./authHeader";

const EMPTY_STATS = {
    latest: [], latestCount: 0,
    topLiked: [], topLikedCount: 0,
    topCommented: [], topCommentedCount: 0,
};

const FreeBoardStatsService = {
    getUserStats: (userId) =>
        http.get(`/freeboard/stats/user/${userId}`, authHeader())
            .then(r => r.data)
            .catch(() => null),

    getPublicStats: () =>
        http.get("/freeboard/stats/public")
            .then(r => r.data)
            .catch(() => ({ ...EMPTY_STATS })),

    getAdminStats: () =>
        http.get("/freeboard/stats/admin", authHeader())
            .then(r => r.data)
            .catch(() => ({ ...EMPTY_STATS, reportedPosts: [], reportedPostsCount: 0, reportedComments: [], reportedCommentsCount: 0 })),

    togglePostHidden: (boardId, hidden) =>
        http.put(`/freeboard/stats/admin/post/${boardId}/hidden`, { hidden: !!hidden }, authHeader())
            .then(r => r.data)
            .catch(() => null),

    toggleCommentHidden: (commentId, hidden) =>
        http.put(`/freeboard/stats/admin/comment/${commentId}/hidden`, { hidden: !!hidden }, authHeader())
            .then(r => r.data)
            .catch(() => null),
};

export default FreeBoardStatsService;
