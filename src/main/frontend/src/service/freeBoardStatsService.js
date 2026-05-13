import http from "../http-common";

/**
 * 자유게시판 통계 및 관리자 기능을 위한 서비스
 */
const FreeBoardStatsService = {

  /**
   * 일반 유저용 활동 통계 조회
   * @param {string} userId - 조회를 원하는 사용자 ID
   */
  getUserStats: async (userId) => {
    try {
      const res = await http.get(`/freeboard/stats/user/${userId}`);
      return res.data;
    } catch (e) {
      console.error("User Stats Fetch Error:", e);
      return null;
    }
  },

  
  getAdminStats: async () => {
    try {
      const res = await http.get("/freeboard/stats/admin");
      return res.data; 
    } catch (e) {
      console.error("Admin Stats Fetch Error:", e);
      return {
        latest: [], latestCount: 0,
        topLiked: [], topLikedCount: 0,
        topCommented: [], topCommentedCount: 0,
        reportedPosts: [], reportedPostsCount: 0,
        reportedComments: [], reportedCommentsCount: 0
      }; 
    }
  },

  /**
   * 게시글 숨김/복원 토글
   * @param {number} boardId - 게시글 번호
   * @param {boolean} hidden - 숨김 여부 (true: 숨김, false: 복원)
   */
  togglePostHidden: async (boardId, hidden) => {
    try {
     
      const res = await http.put(`/freeboard/stats/admin/post/${boardId}/hidden`, { 
        hidden: !!hidden 
      });
      return res.data;
    } catch (e) {
      console.error(`Post Hidden Toggle Error (ID: ${boardId}):`, e);
      return null;
    }
  },

  /**
   * 댓글/대댓글 숨김/복원 토글
   * @param {number} commentId - 댓글 번호
   * @param {boolean} hidden - 숨김 여부 (true: 숨김, false: 복원)
   */
  toggleCommentHidden: async (commentId, hidden) => {
    try {
      
      if (!commentId) {
        throw new Error("commentId is required");
      }

      const res = await http.put(`/freeboard/stats/admin/comment/${commentId}/hidden`, { 
        hidden: !!hidden 
      });
      return res.data;
    } catch (e) {
      console.error(`Comment Hidden Toggle Error (ID: ${commentId}):`, e);
      return null;
    }
  }
};

export default FreeBoardStatsService;