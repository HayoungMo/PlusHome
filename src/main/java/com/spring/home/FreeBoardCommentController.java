package com.spring.home;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.FreeBoardCommentDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.mapper.CompanyMapper;
import com.spring.home.mapper.UserMapper;
import com.spring.home.service.FreeBoardCommentService;
import com.spring.home.util.JwtUtil;

import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RequiredArgsConstructor
@RestController
@RequestMapping("/freeboard/comments")
public class FreeBoardCommentController {

    private final FreeBoardCommentService commentService;
    private final JwtUtil       jwtUtil;
    private final CompanyMapper companyMapper;
    private final UserMapper    userMapper;

    private static final String ADMIN_TYPE     = "admin";
    private static final String GUEST_ID       = "Guest";
    private static final String GUEST_NAME     = "방문자";

    // ───────────────────────────────────────────────
    // 헬퍼
    // ───────────────────────────────────────────────

    /**
     * Authorization 헤더에서 JWT 파싱 → UserDTO 반환.
     * 헤더 없음 / 만료 / 파싱 실패 시 null.
     */
    private UserDTO getLoginUser(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        try {
            String token = auth.substring(7).trim();
            if (jwtUtil.isExpired(token)) return null;
            UserDTO user = new UserDTO();
            user.setId(jwtUtil.getId(token));
            user.setType(jwtUtil.getType(token));
            return user;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * users 테이블 type 기반 표시명 결정.
     *   company → "[c_kind] c_name"
     *   user / admin → userId 그대로
     *   guest → "방문자"
     */
    private String resolveDisplayName(String userId) {
        if (userId == null || userId.isEmpty() || GUEST_ID.equals(userId)) return GUEST_NAME;
        try {
            UserDTO user = userMapper.findById(userId);
            if (user != null && "company".equals(user.getType())) {
                CompanyDTO c = companyMapper.getReadData(userId);
                if (c != null) {
                    String kind = (c.getC_kind() != null) ? c.getC_kind().trim() : "";
                    String name = (c.getC_name() != null) ? c.getC_name().trim() : userId;
                    return kind.isEmpty() ? name : kind + " " + name;
                }
            }
        } catch (Exception e) {
            // 조회 실패 시 userId 그대로 반환
        }
        return userId;
    }

    // ───────────────────────────────────────────────
    // 1. 댓글 목록 조회 (인증 불필요)
    // ───────────────────────────────────────────────

    @GetMapping("/{boardId}")
    public ResponseEntity<List<FreeBoardCommentDTO>> getList(
            @PathVariable Long boardId,
            @RequestParam(value = "type", required = false, defaultValue = "guest") String type) {
        return ResponseEntity.ok(commentService.getComments(boardId, type));
    }

    // ───────────────────────────────────────────────
    // 2. 댓글 등록 (로그인 필수, userId/userName 서버에서 결정)
    // ───────────────────────────────────────────────

    @PostMapping("/write")
    public ResponseEntity<?> write(
            @RequestBody FreeBoardCommentDTO dto,
            HttpServletRequest request) {

        UserDTO loginUser = getLoginUser(request);
        if (loginUser == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        if ("deleted".equals(loginUser.getType()))
            return ResponseEntity.status(403).body("탈퇴한 회원은 댓글을 작성할 수 없습니다.");

        // 클라이언트 값 무시, 서버에서 결정
        dto.setUserId(loginUser.getId());
        dto.setUserName(resolveDisplayName(loginUser.getId()));

        boolean result = commentService.insertComment(dto);
        return result
                ? ResponseEntity.ok("Success")
                : ResponseEntity.status(500).body("등록 실패");
    }

    // ───────────────────────────────────────────────
    // 3. 댓글 삭제 (로그인 필수, 본인 또는 관리자)
    // ───────────────────────────────────────────────

    @DeleteMapping("/{boardId}/{commentId}")
    public ResponseEntity<String> delete(
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            HttpServletRequest request) {

        UserDTO loginUser = getLoginUser(request);
        if (loginUser == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        String loginId   = loginUser.getId();
        String loginType = loginUser.getType();

        boolean result = commentService.deleteComment(boardId, commentId, loginId, loginType);
        return result
                ? ResponseEntity.ok("success")
                : ResponseEntity.status(403).body("삭제 권한이 없거나 실패했습니다.");
    }

    // ───────────────────────────────────────────────
    // 4. 댓글 수정 (로그인 필수, 본인 또는 관리자)
    // ───────────────────────────────────────────────

    @PutMapping("/update")
    public ResponseEntity<String> update(
            @RequestBody FreeBoardCommentDTO dto,
            HttpServletRequest request) {

        if (dto == null || dto.getCommentId() == null
                || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("입력값이 올바르지 않습니다.");
        }

        UserDTO loginUser = getLoginUser(request);
        if (loginUser == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        FreeBoardCommentDTO existing = commentService.getComment(dto.getCommentId());
        if (existing == null) return ResponseEntity.notFound().build();

        boolean isAdmin = ADMIN_TYPE.equals(loginUser.getType());
        boolean isOwner = existing.getUserId() != null
                && !GUEST_ID.equals(existing.getUserId())
                && existing.getUserId().equals(loginUser.getId());

        if (!isAdmin && !isOwner) return ResponseEntity.status(403).body("작성자만 수정할 수 있습니다.");

        FreeBoardCommentDTO safe = new FreeBoardCommentDTO();
        safe.setCommentId(existing.getCommentId());
        safe.setContent(dto.getContent().trim());

        return commentService.updateComment(safe)
                ? ResponseEntity.ok("success")
                : ResponseEntity.internalServerError().body("수정 실패");
    }
}
