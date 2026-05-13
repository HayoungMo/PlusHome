package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.spring.home.dto.FreeBoardDTO;
import com.spring.home.service.FreeBoardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/freeboard")
@RequiredArgsConstructor
public class FreeBoardController {

    private final FreeBoardService freeBoardService;

    // 자유게시판 모듈 공통 상수 (PAGE_SIZE 는 서비스 상수 재사용)
    private static final String GUEST_ID         = "Guest";
    private static final String GUEST_NAME       = "방문자";
    private static final int    TITLE_MAX_LENGTH = 200;

    // 입력값 기본 검증 (제목/내용 필수)
    private String validate(FreeBoardDTO dto) {
        if (dto == null) return "잘못된 요청입니다.";
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            return "제목을 입력해주세요.";
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return "내용을 입력해주세요.";
        }
        if (dto.getTitle().length() > TITLE_MAX_LENGTH) {
            return "제목은 " + TITLE_MAX_LENGTH + "자 이하로 입력해주세요.";
        }
        return null;
    }

    // 1. 게시글 작성
    @PostMapping("/write")
    public ResponseEntity<?> write(@RequestBody FreeBoardDTO dto) {
        String err = validate(dto);
        if (err != null) return ResponseEntity.badRequest().body(err);

        if (dto.getUserId() != null && !dto.getUserId().isEmpty()) {
            dto.setUserName(dto.getUserId());
        } else {
            dto.setUserId(GUEST_ID);
            dto.setUserName(GUEST_NAME);
        }

        dto.setViewCount(0);
        dto.setLikeCount(0);
        dto.setCommentCount(0);
        dto.setHidden(0); // 기본값 0(공개) 설정

        try {
            freeBoardService.insertData(dto);
            return ResponseEntity.ok("게시글이 등록되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("등록 실패");
        }
    }

    // 2. 목록 조회 (type 파라미터 추가 및 페이징 로직 완성)
    @GetMapping("/list")
    public ResponseEntity<?> getList(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "title") String searchKey,
            @RequestParam(defaultValue = "") String searchValue,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "user") String type) {
        try {
            // 서비스 호출 시 type 전달하여 hidden 필터링 적용
            Map<String, Object> result = freeBoardService.getLists(pageNum, searchKey, searchValue, category, type);

            // 리액트 Pagination 컴포넌트를 위한 추가 정보 계산
            int dataCount = (int) result.get("dataCount");
            int totalPage = (int) Math.ceil((double) dataCount / FreeBoardService.PAGE_SIZE);

            result.put("totalPage", totalPage);
            result.put("currentPage", pageNum);

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

    // 3-1. 이전글 / 다음글 조회
    @GetMapping("/article/{boardId}/nav")
    public ResponseEntity<?> getArticleNav(@PathVariable Long boardId) {
        try {
            return ResponseEntity.ok(freeBoardService.getNav(boardId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("이전/다음 글 조회 실패");
        }
    }

    // 4. 수정
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody FreeBoardDTO dto) {
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

            FreeBoardDTO safe = new FreeBoardDTO();
            safe.setBoardId(existing.getBoardId());
            safe.setTitle(dto.getTitle());
            safe.setContent(dto.getContent());
            safe.setCategory(dto.getCategory());

            freeBoardService.updateData(safe, existing.getUserId());
            return ResponseEntity.ok("수정되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("수정 실패");
        }
    }

    // 4-1. 좋아요
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

    // 5. 삭제
    @DeleteMapping("/delete/{boardId}")
    public ResponseEntity<?> delete(@PathVariable Long boardId) {
        try {
            FreeBoardDTO existing = freeBoardService.getDataOnly(boardId);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            freeBoardService.deleteData(boardId, existing.getUserId());
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("삭제 실패");
        }
    }

    // 5-1. 다중 삭제
    @PostMapping("/delete-multi")
    public ResponseEntity<?> deleteMulti(@RequestBody Map<String, List<Long>> body) {
        List<Long> boardIds = (body != null) ? body.get("boardIds") : null;
        if (boardIds == null || boardIds.isEmpty()) {
            return ResponseEntity.badRequest().body("선택된 게시글이 없습니다.");
        }

        int success = 0;
        for (Long boardId : boardIds) {
            try {
                FreeBoardDTO existing = freeBoardService.getDataOnly(boardId);
                if (existing != null) {
                    freeBoardService.deleteData(boardId, existing.getUserId());
                    success++;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("requested", boardIds.size());
        result.put("success", success);
        return ResponseEntity.ok(result);
    }
}