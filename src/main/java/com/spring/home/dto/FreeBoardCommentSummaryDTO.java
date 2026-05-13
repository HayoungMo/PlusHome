package com.spring.home.dto;

import lombok.Data;

/**
 * 관리자 사이드 패널의 "신고댓글/대댓글" 리스트용 경량 DTO.
 * 기존 FreeBoardCommentDTO 는 그대로 두고 분리.
 */
@Data
public class FreeBoardCommentSummaryDTO {
    private Long commentId;
    private Long boardId;
    private String userId;
    private String userName;
    private String content;
    private Long parentId; // 대댓글이면 부모 commentId
    private String createdAt;

    /** 숨김 처리 여부 (0 = 노출, 1 = 숨김 - Oracle NUMBER 매핑 안전) */
    private int hidden;

    /** 신고 누적 카운트 (테이블 미구현 시 0) */
    private int reportCount;
}
