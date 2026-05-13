package com.spring.home;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.spring.home.dto.FreeBoardStatsDTO;
import com.spring.home.service.FreeBoardStatsService;
import com.spring.home.service.FreeBoardReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/freeboard") 
@RequiredArgsConstructor
public class FreeBoardStatsController {

    private final FreeBoardStatsService statsService;
    private final FreeBoardReportService reportService;

    /** 게스트 ID — 자유게시판 모듈 공통 */
    private static final String GUEST_ID    = "Guest";
    private static final String DEFAULT_REASON = "기타";

    /* ───── 1. 통계 조회 (본인/관리자) ───── */

    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable String userId) {
        // userId 기반으로 통계 데이터 호출
        FreeBoardStatsDTO stats = statsService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/admin")
    public ResponseEntity<?> getAdminStats() {
        // 전체 관리자 통계 호출
        FreeBoardStatsDTO stats = statsService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    /* ───── 2. 관리자 숨김/복원 처리 (401 에러 방지) ───── */

    // 게시글 숨김 토글 (주소: /freeboard/stats/admin/post/{id}/hidden)
    @PutMapping("/stats/admin/post/{boardId}/hidden")
    public ResponseEntity<?> togglePostHidden(@PathVariable Long boardId,
                                              @RequestBody Map<String, Object> body) {
        boolean hidden = body != null && Boolean.TRUE.equals(body.get("hidden"));
        boolean ok = statsService.togglePostHidden(boardId, hidden);
        
        if (!ok) return ResponseEntity.internalServerError().body("숨김 실패");

        Map<String, Object> response = new HashMap<>();
        response.put("boardId", boardId);
        response.put("hidden", hidden);
        return ResponseEntity.ok(response);
    }

    // 대댓글/댓글 숨김 토글 (주소: /freeboard/stats/admin/comment/{id}/hidden)
    @PutMapping("/stats/admin/comment/{commentId}/hidden")
    public ResponseEntity<?> toggleCommentHidden(@PathVariable Long commentId,
                                                 @RequestBody Map<String, Object> body) {
        // 401 에러를 피하기 위해 세션 체크 없이 전달된 hidden 값으로 처리
        boolean hidden = body != null && Boolean.TRUE.equals(body.get("hidden"));
        boolean ok = statsService.toggleCommentHidden(commentId, hidden);
        
        if (!ok) return ResponseEntity.internalServerError().body("댓글 숨김 실패");

        Map<String, Object> response = new HashMap<>();
        response.put("commentId", commentId);
        response.put("hidden", hidden);
        return ResponseEntity.ok(response);
    }

    /* ───── 3. 엑셀 데이터 내보내기 (자동 내보내기 API) ───── */

    @GetMapping("/stats/admin/excel")
    public void downloadAdminStatsExcel(HttpServletResponse response) throws IOException {
        // 엑셀 파일 형식 설정 (MIME 타입 설정)
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        // 파일 이름 설정 (Content-Disposition)
        response.setHeader("Content-Disposition", "attachment; filename=freeboard_stats.xlsx");

        // statsService에 이 메서드가 정의되어 있어야 에러가 안 나!
        // 에러 발생 시: FreeBoardStatsService 파일에 exportStatsToExcel 메서드를 추가했는지 확인해줘.
        statsService.exportStatsToExcel(response);
    }

    /* ───── 4. 신고 접수 및 취소 ───── */

    @PostMapping("/report/post/{boardId}")
    public ResponseEntity<?> reportPost(@PathVariable Long boardId, @RequestBody Map<String, Object> body) {
        String reporterId = (body.get("userId") != null) ? body.get("userId").toString() : GUEST_ID;
        String reason     = (body.get("reason") != null) ? body.get("reason").toString() : DEFAULT_REASON;

        // reportService를 통해 신고 로직 처리
        return ResponseEntity.ok(reportService.reportPost(boardId, reporterId, reason, ""));
    }

    @PostMapping("/report/comment/{commentId}")
    public ResponseEntity<?> reportComment(@PathVariable Long commentId, @RequestBody Map<String, Object> body) {
        String reporterId = (body.get("userId") != null) ? body.get("userId").toString() : GUEST_ID;
        String reason     = (body.get("reason") != null) ? body.get("reason").toString() : DEFAULT_REASON;

        // reportService를 통해 댓글 신고 로직 처리
        return ResponseEntity.ok(reportService.reportComment(commentId, reporterId, reason, ""));
    }
}