package com.spring.home;

import com.spring.home.dto.FreeBoardCommentDTO;
import com.spring.home.dto.UserDTO;
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
    private final JwtUtil jwtUtil;

    private static final String ADMIN_TYPE = "admin";
    private static final String GUEST_ID   = "Guest";

    /* ───────── 헬퍼 ───────── */

    private UserDTO getLoginUser(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        try {
            String token = auth.substring(7);
            UserDTO user = new UserDTO();
            user.setId(jwtUtil.getId(token));
            user.setType(jwtUtil.getType(token));
            return user;
        } catch (Exception e) {
            return null;
        }
    }

    /* ───────── 엔드포인트 ───────── */

    // 1. 댓글 목록 조회
    @GetMapping("/{boardId}")
    public ResponseEntity<List<FreeBoardCommentDTO>> getList(
            @PathVariable Long boardId,
            @RequestParam(value = "type", required = false, defaultValue = "guest") String type) {
        return ResponseEntity.ok(commentService.getComments(boardId, type));
    }

    // 2. 댓글 등록
    @PostMapping("/write")
    public ResponseEntity<?> write(
            @RequestBody FreeBoardCommentDTO dto,
            HttpServletRequest request) {

        if (dto.getUserId() == null || dto.getUserId().isEmpty()) {
            UserDTO loginUser = getLoginUser(request);
            if (loginUser == null) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }
            dto.setUserId(loginUser.getId());
        }

        boolean result = commentService.insertComment(dto);
        return result
                ? ResponseEntity.ok("Success")
                : ResponseEntity.status(500).body("등록 실패");
    }

    // 3. 댓글 삭제
    @DeleteMapping("/{boardId}/{commentId}")
    public ResponseEntity<String> delete(
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            HttpServletRequest request) {

        UserDTO loginUser = getLoginUser(request);
        String loginId   = loginUser != null ? loginUser.getId()   : GUEST_ID;
        String loginType = loginUser != null ? loginUser.getType() : "guest";

        boolean result = commentService.deleteComment(boardId, commentId, loginId, loginType);
        return result
                ? ResponseEntity.ok("success")
                : ResponseEntity.status(403).body("삭제 권한이 없거나 실패했습니다.");
    }

    // 4. 댓글 수정
    @PutMapping("/update")
    public ResponseEntity<String> update(
            @RequestBody FreeBoardCommentDTO dto,
            HttpServletRequest request) {

        if (dto == null || dto.getCommentId() == null
                || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("입력값이 올바르지 않습니다.");
        }

        FreeBoardCommentDTO existing = commentService.getComment(dto.getCommentId());
        if (existing == null) return ResponseEntity.notFound().build();

        UserDTO loginUser = getLoginUser(request);
        String loginId = loginUser != null ? loginUser.getId() : GUEST_ID;
        boolean isAdmin = loginUser != null && ADMIN_TYPE.equals(loginUser.getType());
        boolean isOwner = existing.getUserId() != null
                && !GUEST_ID.equals(existing.getUserId())
                && existing.getUserId().equals(loginId);

        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).body("작성자만 수정할 수 있습니다.");
        }

        FreeBoardCommentDTO safe = new FreeBoardCommentDTO();
        safe.setCommentId(existing.getCommentId());
        safe.setContent(dto.getContent().trim());

        return commentService.updateComment(safe)
                ? ResponseEntity.ok("success")
                : ResponseEntity.internalServerError().body("수정 실패");
    }
}