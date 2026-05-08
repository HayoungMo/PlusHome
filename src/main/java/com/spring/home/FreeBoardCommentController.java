package com.spring.home;

import com.spring.home.dto.FreeBoardCommentDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.service.FreeBoardCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/freeboard/comments")
public class FreeBoardCommentController {

    @Autowired
    private FreeBoardCommentService commentService;

    // 관리자 권한 타입 (USERS.TYPE = 'admin' 인 계정은 모든 권한)
    private static final String ADMIN_TYPE = "admin";

    // 세션에서 로그인 유저 꺼내는 공통 메서드
    private UserDTO getLoginUser(HttpSession session) {
        return (UserDTO) session.getAttribute("loginUser");
    }

    // 관리자 여부: type 이 'admin' 인 사용자
    private boolean isAdmin(UserDTO loginUser) {
        return loginUser != null && ADMIN_TYPE.equals(loginUser.getType());
    }

    // 댓글 수정/삭제 권한: 작성자 본인 또는 관리자(type=admin)
    private boolean canModify(FreeBoardCommentDTO existing, UserDTO loginUser) {
        if (loginUser == null) return false;
        if (isAdmin(loginUser)) return true;
        return existing != null
                && existing.getUserId() != null
                && !"Guest".equals(existing.getUserId())
                && existing.getUserId().equals(loginUser.getId());
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<List<FreeBoardCommentDTO>> list(@PathVariable("boardId") Long boardId) {
        return ResponseEntity.ok(commentService.getComments(boardId));
    }


    @PostMapping("/write")
    public ResponseEntity<String> write(@RequestBody FreeBoardCommentDTO dto, HttpSession session) {
        UserDTO loginUser = getLoginUser(session);

        // 작성자 정보는 항상 서버에서 결정 (클라이언트 값 신뢰 X)
        if (loginUser != null) {
            dto.setUserId(loginUser.getId());
            dto.setUserName(loginUser.getName());
        } else {
            dto.setUserId("Guest");
            dto.setUserName("방문자");
        }

        if (commentService.addComment(dto)) {
            return ResponseEntity.ok("success");
        }
        return ResponseEntity.internalServerError().body("fail");
    }


    // 댓글 삭제 (작성자 본인 또는 관리자 admin1만 가능)
    @DeleteMapping("/{boardId}/{commentId}")
    public ResponseEntity<String> delete(
            @PathVariable("commentId") Long commentId,
            @PathVariable("boardId") Long boardId,
            HttpSession session) {

        UserDTO loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        FreeBoardCommentDTO existing = commentService.getComment(commentId);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (!canModify(existing, loginUser)) {
            return ResponseEntity.status(403).body("작성자만 삭제할 수 있습니다.");
        }

        if (commentService.removeComment(boardId, commentId)) {
            return ResponseEntity.ok("success");
        }

        return ResponseEntity.internalServerError().body("fail");
    }

    // 댓글 수정 (작성자 본인 또는 관리자 admin1만 가능)
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody FreeBoardCommentDTO dto, HttpSession session) {
        UserDTO loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        if (dto == null || dto.getCommentId() == null) {
            return ResponseEntity.badRequest().body("잘못된 요청입니다.");
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("내용을 입력해주세요.");
        }

        FreeBoardCommentDTO existing = commentService.getComment(dto.getCommentId());
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (!canModify(existing, loginUser)) {
            return ResponseEntity.status(403).body("작성자만 수정할 수 있습니다.");
        }

        // 수정 가능한 필드만 반영 (작성자 등 변조 불가)
        FreeBoardCommentDTO safe = new FreeBoardCommentDTO();
        safe.setCommentId(existing.getCommentId());
        safe.setContent(dto.getContent());

        if (commentService.modifyComment(safe)) {
            return ResponseEntity.ok("success");
        }
        return ResponseEntity.internalServerError().body("fail");
    }
}
