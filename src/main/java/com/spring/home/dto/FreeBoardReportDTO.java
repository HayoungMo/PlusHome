package com.spring.home.dto;

import lombok.Data;

/**
 * 자유게시판 신고 단건 DTO
 * - targetType: "post"    -> freeboard_report (targetId = boardId)
 * - targetType: "comment" -> freeboard_comment_report (targetId = commentId)
 *
 * Mapper 에서는 둘 다 같은 구조로 사용 (테이블만 분기)
 */
@Data
public class FreeBoardReportDTO {
    private Long   reportId;
    private Long   targetId;     // boardId 또는 commentId
    private String reporterId;   // 신고한 유저 ID
    private String reason;       // 사유 (스팸, 욕설 등)
    private String detail;       // 상세 설명 (optional)
    private String createdAt;
}
