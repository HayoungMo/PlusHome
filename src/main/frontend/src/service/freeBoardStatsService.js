import http from "../http-common";

const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const FreeBoardStatsService = {

    // 일반 유저 활동 통계 (로그인 필요)
    getUserStats: async (userId) => {
        try {
            const res = await http.get(`/freeboard/stats/user/${userId}`, authHeader());
            return res.data;
        } catch (e) {
            console.error("User Stats Fetch Error:", e);
            return null;
        }
    },

    // 공개 통계 — 인증 없이 누구나
    getPublicStats: async () => {
        try {
            const res = await http.get("/freeboard/stats/public");
            return res.data;
        } catch (e) {
            console.error("Public Stats Fetch Error:", e);
            return {
                latest: [], latestCount: 0,
                topLiked: [], topLikedCount: 0,
                topCommented: [], topCommentedCount: 0,
            };
        }
    },

    // 관리자 전용 통계 (admin JWT 필요)
    getAdminStats: async () => {
        try {
            const res = await http.get("/freeboard/stats/admin", authHeader());
            return res.data;
        } catch (e) {
            console.error("Admin Stats Fetch Error:", e);
            return {
                latest: [], latestCount: 0,
                topLiked: [], topLikedCount: 0,
                topCommented: [], topCommentedCount: 0,
                reportedPosts: [], reportedPostsCount: 0,
                reportedComments: [], reportedCommentsCount: 0,
            };
        }
    },

    // 게시글 숨김/복원 토글 (admin JWT 필요)
    togglePostHidden: async (boardId, hidden) => {
        try {
            const res = await http.put(
                `/freeboard/stats/admin/post/${boardId}/hidden`,
                { hidden: !!hidden },
                authHeader()
            );
            return res.data;
        } catch (e) {
            console.error(`Post Hidden Toggle Error (ID: ${boardId}):`, e);
            return null;
        }
    },

    // 댓글 숨김/복원 토글 (admin JWT 필요)
    toggleCommentHidden: async (commentId, hidden) => {
        try {
            if (!commentId) throw new Error("commentId is required");
            const res = await http.put(
                `/freeboard/stats/admin/comment/${commentId}/hidden`,
                { hidden: !!hidden },
                authHeader()
            );
            return res.data;
        } catch (e) {
            console.error(`Comment Hidden Toggle Error (ID: ${commentId}):`, e);
            return null;
        }
    },
};

export default FreeBoardStatsService;
