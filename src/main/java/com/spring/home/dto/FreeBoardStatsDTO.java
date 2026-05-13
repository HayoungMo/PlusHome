package com.spring.home.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class FreeBoardStatsDTO {

    // 1. 일반 유저 및 공용 통계 (최신글, 인기글 등)
    private List<FreeBoardSummaryDTO> latest = new ArrayList<>();
    private int latestCount;

    private List<FreeBoardSummaryDTO> topLiked = new ArrayList<>();
    private int topLikedCount;

    private List<FreeBoardSummaryDTO> topCommented = new ArrayList<>();
    private int topCommentedCount;

    // 2. 관리자 전용 - 신고 게시글 목록
    private List<FreeBoardSummaryDTO> reportedPosts = new ArrayList<>();
    private int reportedPostsCount;

    /** * 3. 관리자 전용 - 신고 댓글 목록 
         */
    private List<FreeBoardSummaryDTO> reportedComments = new ArrayList<>();
    private int reportedCommentsCount;
}