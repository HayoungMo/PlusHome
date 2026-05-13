package com.spring.home.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.FreeBoardSummaryDTO;

@Mapper
public interface FreeBoardStatsMapper {

    /* ────────── [일반 유저용] 본인 활동 통계 ────────── */
    
    // 내 최신글 조회
    List<FreeBoardSummaryDTO> selectMyLatest(@Param("userId") String userId, @Param("limit") int limit);
    int countMyAll(@Param("userId") String userId);

    // 내 인기글 (좋아요순)
    List<FreeBoardSummaryDTO> selectMyTopLiked(@Param("userId") String userId, @Param("limit") int limit);
    int countMyWithLikes(@Param("userId") String userId);

    // 내 인기글 (댓글순)
    List<FreeBoardSummaryDTO> selectMyTopCommented(@Param("userId") String userId, @Param("limit") int limit);
    int countMyWithComments(@Param("userId") String userId);


    /* ────────── [관리자용] 전체 현황 통계 ────────── */
    
    // 전체 최신글 조회
    List<FreeBoardSummaryDTO> selectAllLatest(@Param("limit") int limit);
    int countAll();

    // 전체 인기글 (좋아요순)
    List<FreeBoardSummaryDTO> selectAllTopLiked(@Param("limit") int limit);
    int countAllWithLikes();

    // 전체 인기글 (댓글순)
    List<FreeBoardSummaryDTO> selectAllTopCommented(@Param("limit") int limit);
    int countAllWithComments();


    /* ────────── [관리자용] 신고 내역 조회 ────────── */
    
    // 신고된 게시글 목록 및 총 개수
    List<FreeBoardSummaryDTO> selectReportedPosts(@Param("limit") int limit);
    int countReportedPosts();

    // 신고된 댓글 목록 및 총 개수 
    List<FreeBoardSummaryDTO> selectReportedComments(@Param("limit") int limit);
    int countReportedComments();


    /* ────────── [관리자용] 숨김 처리(Hidden) 관리 ────────── */
    
    // 게시글 숨김 처리 토글
    int updatePostHidden(@Param("boardId") Long boardId, @Param("hidden") int hidden);

    // 댓글 숨김 처리 토글
    int updateCommentHidden(@Param("commentId") Long commentId, @Param("hidden") int hidden);

    // 게시글 일괄 숨김 처리 (관리자 리스트 체크박스용)
    int updateBatchHidden(Map<String, Object> params);
}