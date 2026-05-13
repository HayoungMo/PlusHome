package com.spring.home.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.FreeBoardReportDTO;
import com.spring.home.mapper.FreeBoardReportMapper;
import com.spring.home.mapper.FreeBoardStatsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 자유게시판 - 신고 접수 / 자동 숨김 처리 서비스.
 *
 *  - INSERT 후 누적 신고수가 AUTO_HIDDEN_THRESHOLD 이상이면 자동으로 hidden=1
 *  - 같은 사용자가 같은 대상을 중복 신고하면 차단 (DUPLICATE)
 *  - 신고/숨김 테이블이 없는 환경에서도 try/catch 로 graceful fallback
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FreeBoardReportService {

    private final FreeBoardReportMapper reportMapper;
    private final FreeBoardStatsMapper  statsMapper; // 자동 숨김에서 hidden 토글용

    /** 누적 신고 N건 이상이면 자동 숨김 */
    private static final int AUTO_HIDDEN_THRESHOLD = 3;

    /** 게스트 ID — 자유게시판 모듈 공통 */
    private static final String GUEST_ID = "Guest";

    /** 신고 대상 타입 — 'post' / 'comment' */
    private static final String TARGET_TYPE_POST    = "post";
    private static final String TARGET_TYPE_COMMENT = "comment";

    /* ───────── 게시글 신고 ───────── */
    public Map<String, Object> reportPost(Long boardId,
                                          String reporterId,
                                          String reason,
                                          String detail) {
        return submitReport(TARGET_TYPE_POST, boardId, reporterId, reason, detail);
    }

    /* ───────── 댓글 신고 ───────── */
    public Map<String, Object> reportComment(Long commentId,
                                             String reporterId,
                                             String reason,
                                             String detail) {
        return submitReport(TARGET_TYPE_COMMENT, commentId, reporterId, reason, detail);
    }

    @Transactional
    protected Map<String, Object> submitReport(String type,
                                               Long targetId,
                                               String reporterId,
                                               String reason,
                                               String detail) {
        Map<String, Object> result = new HashMap<>();
        result.put("type", type);
        result.put("targetId", targetId);

        if (reporterId == null || reporterId.isEmpty() || GUEST_ID.equals(reporterId)) {
            result.put("status", "UNAUTHORIZED");
            return result;
        }

        boolean isPost = TARGET_TYPE_POST.equals(type);

        // 1) 중복 신고 체크
        try {
            int dup = isPost
                    ? reportMapper.existsPostReport(targetId, reporterId)
                    : reportMapper.existsCommentReport(targetId, reporterId);
            if (dup > 0) {
                result.put("status", "DUPLICATE");
                result.put("count", currentCount(type, targetId));
                return result;
            }
        } catch (Exception e) {
            log.warn("신고 중복 체크 실패 (테이블 없음 가능): {}", e.getMessage());
            result.put("status", "NO_TABLE");
            return result;
        }

        // 2) INSERT
        FreeBoardReportDTO dto = new FreeBoardReportDTO();
        dto.setTargetId(targetId);
        dto.setReporterId(reporterId);
        dto.setReason(reason);
        dto.setDetail(detail);

        try {
            int inserted = isPost
                    ? reportMapper.insertPostReport(dto)
                    : reportMapper.insertCommentReport(dto);
            if (inserted <= 0) {
                result.put("status", "FAILED");
                return result;
            }
        } catch (Exception e) {
            log.warn("신고 INSERT 실패: {}", e.getMessage());
            result.put("status", "NO_TABLE");
            return result;
        }

        // 3) 누적 카운트 조회 + 자동 숨김 처리
        int total = currentCount(type, targetId);
        boolean autoHidden = false;
        if (total >= AUTO_HIDDEN_THRESHOLD) {
            try {
                int updated = isPost
                        ? statsMapper.updatePostHidden(targetId, 1)
                        : statsMapper.updateCommentHidden(targetId, 1);
                autoHidden = updated > 0;
            } catch (Exception e) {
                log.warn("자동 숨김 실패 (hidden 컬럼 없음 가능): {}", e.getMessage());
            }
        }

        result.put("status", "OK");
        result.put("count", total);
        result.put("threshold", AUTO_HIDDEN_THRESHOLD);
        result.put("autoHidden", autoHidden);
        return result;
    }

    private int currentCount(String type, Long targetId) {
        try {
            return TARGET_TYPE_POST.equals(type)
                    ? reportMapper.countPostReportsByTarget(targetId)
                    : reportMapper.countCommentReportsByTarget(targetId);
        } catch (Exception e) {
            return 0;
        }
    }
}
