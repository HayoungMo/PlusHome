package com.spring.home;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.spring.home.dto.FreeBoardStatsDTO;
import com.spring.home.service.FreeBoardStatsService;
import com.spring.home.service.FreeBoardReportService;
import com.spring.home.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/freeboard")
@RequiredArgsConstructor
public class FreeBoardStatsController {

    private final FreeBoardStatsService statsService;
    private final FreeBoardReportService reportService;
    private final JwtUtil jwtUtil;

    /** 게스트 ID — 자유게시판 모듈 공통 */
    private static final String GUEST_ID       = "Guest";
    private static final String DEFAULT_REASON = "기타";

    /** Authorization 헤더에서 type 추출. 관리자이면 "admin" 반환, 아니면 null */
    private String extractAdminType(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        try {
            String token = auth.substring(7);
            if (jwtUtil.isExpired(token)) return null;
            return jwtUtil.getType(token);
        } catch (Exception e) {
            return null;
        }
    }

    /* ───── 1. 통계 조회 ───── */

    /** 로그인 유저 본인 활동 통계 */
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable String userId) {
        FreeBoardStatsDTO stats = statsService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * 공개 통계 (인기글/댓글 많은 글) — 인증 불필요
     * 게스트 포함 누구나 접근 가능 (신고 데이터는 포함하지 않음)
     */
    @GetMapping("/stats/public")
    public ResponseEntity<?> getPublicStats() {
        FreeBoardStatsDTO full = statsService.getAdminStats();
        // 신고 관련 필드는 제외하고 공개 데이터만 반환
        FreeBoardStatsDTO pub = new FreeBoardStatsDTO();
        pub.setLatest(full.getLatest());
        pub.setLatestCount(full.getLatestCount());
        pub.setTopLiked(full.getTopLiked());
        pub.setTopLikedCount(full.getTopLikedCount());
        pub.setTopCommented(full.getTopCommented());
        pub.setTopCommentedCount(full.getTopCommentedCount());
        return ResponseEntity.ok(pub);
    }

    /**
     * 관리자 전체 통계 (신고 데이터 포함) — 관리자 인증 필요
     */
    @GetMapping("/stats/admin")
    public ResponseEntity<?> getAdminStats(HttpServletRequest request) {
        String type = extractAdminType(request);
        if (!"admin".equals(type)) return ResponseEntity.status(403).body("관리자만 접근할 수 있습니다.");
        FreeBoardStatsDTO stats = statsService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    /* ───── 2. 관리자 숨김/복원 처리 (401 에러 방지) ───── */

    // 게시글 숨김 토글 (주소: /freeboard/stats/admin/post/{id}/hidden)
    @PutMapping("/stats/admin/post/{boardId}/hidden")
    public ResponseEntity<?> togglePostHidden(@PathVariable Long boardId,
                                              @RequestBody Map<String, Object> body,
                                              HttpServletRequest request) {
        String type = extractAdminType(request);
        if (!"admin".equals(type)) return ResponseEntity.status(403).body("관리자만 사용할 수 있습니다.");

        boolean hidden = body != null && Boolean.TRUE.equals(body.get("hidden"));
        boolean ok = statsService.togglePostHidden(boardId, hidden);

        if (!ok) return ResponseEntity.internalServerError().body("숨김 실패");

        Map<String, Object> response = new HashMap<>();
        response.put("boardId", boardId);
        response.put("hidden", hidden);
        return ResponseEntity.ok(response);
    }

    // 댓글 숨김 토글 (주소: /freeboard/stats/admin/comment/{id}/hidden)
    @PutMapping("/stats/admin/comment/{commentId}/hidden")
    public ResponseEntity<?> toggleCommentHidden(@PathVariable Long commentId,
                                                 @RequestBody Map<String, Object> body,
                                                 HttpServletRequest request) {
        String type = extractAdminType(request);
        if (!"admin".equals(type)) return ResponseEntity.status(403).body("관리자만 사용할 수 있습니다.");

        boolean hidden = body != null && Boolean.TRUE.equals(body.get("hidden"));
        boolean ok = statsService.toggleCommentHidden(commentId, hidden);

        if (!ok) return ResponseEntity.internalServerError().body("댓글 숨김 실패");

        Map<String, Object> response = new HashMap<>();
        response.put("commentId", commentId);
        response.put("hidden", hidden);
        return ResponseEntity.ok(response);
    }

    /* ───── 3. 엑셀 데이터 내보내기 ───── */

    @GetMapping("/stats/admin/excel")
    public void downloadAdminStatsExcel(HttpServletResponse response,
                                        HttpServletRequest request) throws IOException {
        String type = extractAdminType(request);
        if (!"admin".equals(type)) {
            response.setStatus(403);
            response.getWriter().write("관리자만 사용할 수 있습니다.");
            return;
        }
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=freeboard_stats.xlsx");
        statsService.exportStatsToExcel(response);
    }

    /* ───── 4. 신고 접수 및 취소 ───── */

    @PostMapping("/report/post/{boardId}")
    public ResponseEntity<?> reportPost(@PathVariable Long boardId,
                                        @RequestBody Map<String, Object> body,
                                        HttpServletRequest request) {
        // 로그인 필수 — 게스트/탈퇴 회원 신고 불가
        String type = extractAdminType(request);
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        // deleted 차단은 reportService 내 또는 여기서 처리 가능; JWT type 활용
        String reporterId = (body.get("userId") != null) ? body.get("userId").toString() : GUEST_ID;
        String reason     = (body.get("reason") != null) ? body.get("reason").toString() : DEFAULT_REASON;
        return ResponseEntity.ok(reportService.reportPost(boardId, reporterId, reason, ""));
    }

    @PostMapping("/report/comment/{commentId}")
    public ResponseEntity<?> reportComment(@PathVariable Long commentId,
                                           @RequestBody Map<String, Object> body,
                                           HttpServletRequest request) {
        // 로그인 필수
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        String reporterId = (body.get("userId") != null) ? body.get("userId").toString() : GUEST_ID;
        String reason     = (body.get("reason") != null) ? body.get("reason").toString() : DEFAULT_REASON;
        return ResponseEntity.ok(reportService.reportComment(commentId, reporterId, reason, ""));
    }
}