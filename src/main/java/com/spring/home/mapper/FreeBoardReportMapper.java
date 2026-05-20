package com.spring.home.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.FreeBoardReportDTO;

/**
 * 신고 INSERT / 카운트 / 중복 체크 전용 매퍼.
 *
 * 테이블: freeboard_report, freeboard_comment_report
 * - 두 테이블 구조 동일 -> SQL만 분리, Java 시그니처는 공용 DTO 사용
 */
@Mapper
public interface FreeBoardReportMapper {

    /* ---------- 게시글 신고 ---------- */

    int insertPostReport(FreeBoardReportDTO dto);

    int countPostReportsByTarget(@Param("targetId") Long targetId);

    int existsPostReport(@Param("targetId") Long targetId,
                         @Param("reporterId") String reporterId);

    /* ---------- 댓글 신고 ---------- */

    int insertCommentReport(FreeBoardReportDTO dto);

    int countCommentReportsByTarget(@Param("targetId") Long targetId);

    int existsCommentReport(@Param("targetId") Long targetId,
                            @Param("reporterId") String reporterId);
}
