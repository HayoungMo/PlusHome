package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.FreeBoardDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.mapper.CompanyMapper;
import com.spring.home.mapper.UserMapper;
import com.spring.home.service.FreeBoardService;
import com.spring.home.util.JwtUtil;

import lombok.RequiredArgsConstructor;

/**
 * 자유게시판 컨트롤러
 *
 * 카테고리별 쓰기 권한:
 *   자유      : guest / user / company / admin
 *   질문      : guest / user / admin
 *   정보      : user / company / admin
 *   이벤트/광고: company / admin
 *   공지      : admin only
 */

@RestController
@RequestMapping("/freeboard")
@RequiredArgsConstructor
public class FreeBoardController {

    private final FreeBoardService freeBoardService;
    private final JwtUtil          jwtUtil;
    private final CompanyMapper    companyMapper;
    private final UserMapper       userMapper;

    private static final int    TITLE_MAX_LENGTH = 200;
    private static final String GUEST_ID         = "Guest";
    private static final String GUEST_NAME       = "방문자";

    // ───────────────────────────────────────────────
    // JWT 헬퍼
    // ───────────────────────────────────────────────

    /** Authorization 헤더 → { id, type } 맵. 없거나 만료면 null 반환 */
    private Map<String, String> parseToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7).trim();
        try {
            if (jwtUtil.isExpired(token)) return null;
            Map<String, String> info = new HashMap<>();
            info.put("id",   jwtUtil.getId(token));
            info.put("type", jwtUtil.getType(token));
            return info;
        } catch (Exception e) {
            return null;
        }
    }

    // ───────────────────────────────────────────────
    // 작성자 표시명 결정
    // ───────────────────────────────────────────────

    /**
     * users 테이블에서 실제 type 확인 후 표시명 결정.
     *   company → "[c_kind] c_name"  (DB 에서 조회)
     *   user / admin → userId 그대로
     */
    private String resolveDisplayName(String userId) {
        try {
            UserDTO user = userMapper.findById(userId);
            if (user != null && "company".equals(user.getType())) {
                CompanyDTO company = companyMapper.getReadData(userId);
                if (company != null) {
                    String kind = (company.getC_kind() != null) ? company.getC_kind().trim() : "";
                    String name = (company.getC_name() != null) ? company.getC_name().trim() : userId;
                    return kind.isEmpty() ? name : kind + " " + name;
                }
            }
        } catch (Exception e) {
            // 조회 실패 시 userId 그대로 반환
        }
        return userId;
    }

    // ───────────────────────────────────────────────
    // 입력값 검증
    // ───────────────────────────────────────────────

    private String validate(FreeBoardDTO dto) {
        if (dto == null) return "잘못된 요청입니다.";
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) return "제목을 입력해주세요.";
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) return "내용을 입력해주세요.";
        if (dto.getTitle().length() > TITLE_MAX_LENGTH)
            return "제목은 " + TITLE_MAX_LENGTH + "자 이하로 입력해주세요.";
        return null;
    }

    // ───────────────────────────────────────────────
    // 1. 게시글 작성
    // ───────────────────────────────────────────────

    @PostMapping("/write")
    public ResponseEntity<?> write(
            @RequestBody FreeBoardDTO dto,
            HttpServletRequest request) {

        String err = validate(dto);
        if (err != null) return ResponseEntity.badRequest().body(err);

        Map<String, String> auth = parseToken(request);

        String userId, userType, displayName;

        if (auth == null) {
            // 비로그인 게스트: 자유/질문만 허용
            String cat = dto.getCategory();
            if (cat == null || (!cat.equals("자유") && !cat.equals("질문"))) {
                return ResponseEntity.status(403).body("미가입 사용자는 자유/질문 카테고리만 작성 가능합니다.");
            }
            userId      = GUEST_ID;
            userType    = "guest";
            displayName = GUEST_NAME;
        } else {
            userId   = auth.get("id");
            userType = auth.get("type");

            if ("deleted".equals(userType)) {
                return ResponseEntity.status(403).body("탈퇴한 회원은 게시글을 작성할 수 없습니다.");
            }

            // 카테고리 권한 검증
            try {
                freeBoardService.validateWritePermission(dto.getCategory(), userType);
            } catch (RuntimeException e) {
                return ResponseEntity.status(403).body(e.getMessage());
            }

            // DB 에서 type 확인 후 표시명 결정
            displayName = resolveDisplayName(userId);
        }

        dto.setUserId(userId);
        dto.setUserName(displayName);
        dto.setViewCount(0);
        dto.setLikeCount(0);
        dto.setCommentCount(0);
        dto.setHidden(0);

        try {
            freeBoardService.insertData(dto);
            return ResponseEntity.ok("게시글이 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("등록 실패");
        }
    }

    // ───────────────────────────────────────────────
    // 2. 목록 조회
    // ───────────────────────────────────────────────

    @GetMapping("/list")
    public ResponseEntity<?> getList(
            @RequestParam(defaultValue = "1")      int    pageNum,
            @RequestParam(defaultValue = "title")  String searchKey,
            @RequestParam(defaultValue = "")       String searchValue,
            @RequestParam(defaultValue = "")       String category,
            HttpServletRequest request) {
        try {
            Map<String, String> auth = parseToken(request);
            String type = (auth != null) ? auth.get("type") : "guest";

            Map<String, Object> result = freeBoardService.getLists(pageNum, searchKey, searchValue, category, type);

            int dataCount = (int) result.get("dataCount");
            int totalPage = (int) Math.ceil((double) dataCount / FreeBoardService.PAGE_SIZE);
            result.put("totalPage",   totalPage);
            result.put("currentPage", pageNum);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("목록 조회 실패");
        }
    }

    // ───────────────────────────────────────────────
    // 3. 상세 조회
    // ───────────────────────────────────────────────

    @GetMapping("/article/{boardId}")
    public ResponseEntity<?> getArticle(
            @PathVariable Long boardId,
            HttpServletRequest request) {
        try {
            FreeBoardDTO dto = freeBoardService.getReadData(boardId);
            if (dto == null) return ResponseEntity.notFound().build();

            // 숨김 게시글: 관리자만 열람 가능
            if (dto.getHidden() == 1) {
                Map<String, String> auth = parseToken(request);
                if (auth == null || !"admin".equals(auth.get("type"))) {
                    return ResponseEntity.status(403).body("관리자에 의해 숨겨진 게시글입니다.");
                }
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("상세 조회 실패");
        }
    }

    // ───────────────────────────────────────────────
    // 3-1. 이전글/다음글
    // ───────────────────────────────────────────────

    @GetMapping("/article/{boardId}/nav")
    public ResponseEntity<?> getArticleNav(@PathVariable Long boardId) {
        try {
            return ResponseEntity.ok(freeBoardService.getNav(boardId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("이전/다음 글 조회 실패");
        }
    }

    // ───────────────────────────────────────────────
    // 4. 수정 (로그인 필수, 작성자 본인 또는 관리자)
    // ───────────────────────────────────────────────

    @PutMapping("/update")
    public ResponseEntity<?> update(
            @RequestBody FreeBoardDTO dto,
            HttpServletRequest request) {

        if (dto == null || dto.getBoardId() == null)
            return ResponseEntity.badRequest().body("잘못된 요청입니다.");

        String err = validate(dto);
        if (err != null) return ResponseEntity.badRequest().body(err);

        Map<String, String> auth = parseToken(request);
        if (auth == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        if ("deleted".equals(auth.get("type"))) return ResponseEntity.status(403).body("접근 권한이 없습니다.");

        try {
            FreeBoardDTO safe = new FreeBoardDTO();
            safe.setBoardId(dto.getBoardId());
            safe.setTitle(dto.getTitle().trim());
            safe.setContent(dto.getContent().trim());
            safe.setCategory(dto.getCategory());

            freeBoardService.updateData(safe, auth.get("id"), auth.get("type"));
            return ResponseEntity.ok("수정되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("수정 실패");
        }
    }

    // ───────────────────────────────────────────────
    // 4-1. 좋아요 (로그인 필수)
    // ───────────────────────────────────────────────

    @PutMapping("/like/{boardId}")
    public ResponseEntity<?> like(
            @PathVariable Long boardId,
            HttpServletRequest request) {

        Map<String, String> auth = parseToken(request);
        if (auth == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        if ("deleted".equals(auth.get("type"))) return ResponseEntity.status(403).body("접근 권한이 없습니다.");

        try {
            freeBoardService.updateLikeCount(boardId);
            FreeBoardDTO dto = freeBoardService.getDataOnly(boardId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("좋아요 실패");
        }
    }

    // ───────────────────────────────────────────────
    // 5. 삭제 (로그인 필수, 작성자 본인 또는 관리자)
    // ───────────────────────────────────────────────

    @DeleteMapping("/delete/{boardId}")
    public ResponseEntity<?> delete(
            @PathVariable Long boardId,
            HttpServletRequest request) {

        Map<String, String> auth = parseToken(request);
        if (auth == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        if ("deleted".equals(auth.get("type"))) return ResponseEntity.status(403).body("접근 권한이 없습니다.");

        try {
            freeBoardService.deleteData(boardId, auth.get("id"), auth.get("type"));
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("삭제 실패");
        }
    }

    // ───────────────────────────────────────────────
    // 5-1. 다중 삭제 (관리자 전용)
    // ───────────────────────────────────────────────

    @PostMapping("/delete-multi")
    public ResponseEntity<?> deleteMulti(
            @RequestBody Map<String, List<Long>> body,
            HttpServletRequest request) {

        Map<String, String> auth = parseToken(request);
        if (auth == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        if (!"admin".equals(auth.get("type"))) return ResponseEntity.status(403).body("관리자만 사용할 수 있습니다.");

        List<Long> boardIds = (body != null) ? body.get("boardIds") : null;
        if (boardIds == null || boardIds.isEmpty())
            return ResponseEntity.badRequest().body("선택된 게시글이 없습니다.");

        int success = 0;
        for (Long boardId : boardIds) {
            try {
                freeBoardService.deleteData(boardId, auth.get("id"), "admin");
                success++;
            } catch (Exception e) {
                // 개별 실패 무시, 성공 카운트만 집계
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("requested", boardIds.size());
        result.put("success",   success);
        return ResponseEntity.ok(result);
    }
}
