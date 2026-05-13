package com.spring.home.dto;

import lombok.Data;

/**
 * 사이드 패널 (StatsPanel) 한 줄용 경량 DTO.
 * - 게시글 미리보기에 필요한 최소 필드 + 관리자용 hidden / reportCount
 * - 기존 FreeBoardDTO 는 그대로 두고 통계 화면 전용으로 분리
 */
@Data
public class FreeBoardSummaryDTO {
    private Long boardId;
    private String userId;
    private String userName;
    private String category;
    private String title;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private String createdAt;

    /** 관리자 모드 - 숨김 처리 여부 (0 = 노출, 1 = 숨김 - Oracle NUMBER 매핑 안전) */
    private int hidden;

    /** 관리자 모드 - 신고 누적 카운트 (테이블 미구현 시 0) */
    private int reportCount;
}
