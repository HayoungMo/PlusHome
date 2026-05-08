package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.spring.home.dto.FreeBoardDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.service.FreeBoardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/freeboard")
@RequiredArgsConstructor
public class FreeBoardController {

    private final FreeBoardService freeBoardService;

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

    private boolean canModify(FreeBoardDTO existing, UserDTO loginUser) {
        if (loginUser == null) return false;
        if (isAdmin(loginUser)) return true;
        return existing != null
                && existing.getUserId() != null
                && !"Guest".equals(existing.getUserId())
                && existing.getUserId().equals(loginUser.getId());
    }

    // 입력값 기본 검증 (제목/내용 필수)
    private String validate(FreeBoardDTO dto) {
        if (dto == null) return "잘못된 요청입니다.";
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            return "제목을 입력해주세요.";
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return "내용을 입력해주세요.";
        }
        if (dto.getTitle().length() > 200) {
            return "제목은 200자 이하로 입력해주세요.";
        }
        return null;
    }

    // 1. 게시글 작성 (비로그인 허용 - Guest 처리)
    @PostMapping("/write")
    public ResponseEntity<?> write(@RequestBody FreeBoardDTO dto, HttpSession session) {
        String err = validate(dto);
        if (err != null) return ResponseEntity.badRequest().body(err);

        UserDTO loginUser = getLoginUser(session);

        // 작성자 정보는 항상 서버에서 결정 (클라이언트 값 신뢰 X)
        if (loginUser != null) {
            dto.setUserId(loginUser.getId());
            dto.setUserName(loginUser.getName());
        } else {
            dto.setUserId("Guest");
            dto.setUserName("방문자");
        }

        // 클라이언트가 보낼 수 있는 신뢰 불가 필드 초기화
        dto.setViewCount(0);
        dto.setLikeCount(0);
        dto.setCommentCount(0);

        try {
            freeBoardService.insertData(dto);
            return ResponseEntity.ok("게시글이 등록되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("등록 실패");
        }
    }

    // 2. 목록 조회
    @GetMapping("/list")
    public ResponseEntity<?> getList(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "title") String searchKey,
            @RequestParam(defaultValue = "") String searchValue,
            @RequestParam(defaultValue = "") String category) {
        try {
            Map<String, Object> result = freeBoardService.getLists(pageNum, searchKey, searchValue, category);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("목록 조회 실패");
        }
    }

    // 3. 상세 조회
    @GetMapping("/article/{boardId}")
    public ResponseEntity<?> getArticle(@PathVariable Long boardId) {
        try {
            FreeBoardDTO dto = freeBoardService.getReadData(boardId);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("상세 조회 실패");
        }
    }

    // 3-1. 이전글 / 다음글 조회 ({prev, next} 형태로 반환, 없으면 null)
    @GetMapping("/article/{boardId}/nav")
    public ResponseEntity<?> getArticleNav(@PathVariable Long boardId) {
        try {
            return ResponseEntity.ok(freeBoardService.getNav(boardId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("이전/다음 글 조회 실패");
        }
    }

    // 4. 수정 (로그인 + 작성자 본인만 가능)
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody FreeBoardDTO dto, HttpSession session) {
        UserDTO loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        if (dto == null || dto.getBoardId() == null) {
            return ResponseEntity.badRequest().body("잘못된 요청입니다.");
        }
        String err = validate(dto);
        if (err != null) return ResponseEntity.badRequest().body(err);

        try {
            FreeBoardDTO existing = freeBoardService.getDataOnly(dto.getBoardId());
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }
            // 작성자 본인 또는 관리자(type=admin)만 수정 가능
            if (!canModify(existing, loginUser)) {
                return ResponseEntity.status(403).body("작성자만 수정할 수 있습니다.");
            }

            // 수정 가능한 필드만 반영 (작성자/조회수 등은 변조 불가)
            FreeBoardDTO safe = new FreeBoardDTO();
            safe.setBoardId(existing.getBoardId());
            safe.setTitle(dto.getTitle());
            safe.setContent(dto.getContent());
            safe.setCategory(dto.getCategory());

            // 관리자가 수정할 때는 원작성자 ID로 권한 체크 통과
            String ownerId = isAdmin(loginUser) ? existing.getUserId() : loginUser.getId();
            freeBoardService.updateData(safe, ownerId);
            return ResponseEntity.ok("수정되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("수정 실패");
        }
    }

    // 4-1. 좋아요 (로그인 필요 X — 단순 카운트 증가)
    @PutMapping("/like/{boardId}")
    public ResponseEntity<?> like(@PathVariable Long boardId) {
        try {
            freeBoardService.updateLikeCount(boardId);
            FreeBoardDTO dto = freeBoardService.getDataOnly(boardId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("좋아요 실패");
        }
    }

    // 5. 삭제 (로그인 + 작성자 본인만 가능)
    @DeleteMapping("/delete/{boardId}")
    public ResponseEntity<?> delete(@PathVariable Long boardId, HttpSession session) {
        UserDTO loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        try {
            FreeBoardDTO existing = freeBoardService.getDataOnly(boardId);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }
            // 작성자 본인 또는 관리자(type=admin)만 삭제 가능
            if (!canModify(existing, loginUser)) {
                return ResponseEntity.status(403).body("작성자만 삭제할 수 있습니다.");
            }

            String ownerId = isAdmin(loginUser) ? existing.getUserId() : loginUser.getId();
            freeBoardService.deleteData(boardId, ownerId);
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("삭제 실패");
        }
    }

    // 5-1. 다중 삭제 (로그인 + 본인 글만 삭제됨)
    @PostMapping("/delete-multi")
    public ResponseEntity<?> deleteMulti(@RequestBody Map<String, List<Long>> body, HttpSession session) {
        UserDTO loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        List<Long> boardIds = (body != null) ? body.get("boardIds") : null;
        if (boardIds == null || boardIds.isEmpty()) {
            return ResponseEntity.badRequest().body("선택된 게시글이 없습니다.");
        }

        int success = 0;
        int forbidden = 0;
        boolean adminMode = isAdmin(loginUser);
        for (Long boardId : boardIds) {
            try {
                FreeBoardDTO existing = freeBoardService.getDataOnly(boardId);
                if (existing == null) continue;
                if (!canModify(existing, loginUser)) {
                    forbidden++;
                    continue;
                }
                // 관리자 모드면 모든 글 삭제 허용 (원작성자 ID로 통과)
                String ownerId = adminMode ? existing.getUserId() : loginUser.getId();
                freeBoardService.deleteData(boardId, ownerId);
                success++;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("requested", boardIds.size());
        result.put("success", success);
        result.put("forbidden", forbidden);
        return ResponseEntity.ok(result);
    }
}
