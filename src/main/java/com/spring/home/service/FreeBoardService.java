package com.spring.home.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.FreeBoardDTO;
import com.spring.home.mapper.FreeBoardMapper;
import com.spring.home.mapper.FreeBoardCommentMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FreeBoardService {

    private final FreeBoardMapper freeBoardMapper;
    private final FreeBoardCommentMapper freeBoardCommentMapper;

    /**
     * 자유게시판 페이지 크기 (controller 의 totalPage 계산과 공통)
     */
    public static final int PAGE_SIZE = 8;

    private static final Set<String> ALLOWED_SEARCH_KEYS =
            new HashSet<>(Arrays.asList("title", "userName", "content"));

    private String sanitizeSearchKey(String searchKey) {
        if (searchKey == null || !ALLOWED_SEARCH_KEYS.contains(searchKey)) {
            return "title";
        }
        return searchKey;
    }

    // ─── 목록 조회 + 페이징 (type 인자 추가 반영) ──────────────────────────
    public Map<String, Object> getLists(int pageNum, String searchKey,
                                        String searchValue, String category, String type) throws Exception {
        if (pageNum < 1) pageNum = 1;
        int start = (pageNum - 1) * PAGE_SIZE + 1;
        int end   = pageNum * PAGE_SIZE;

        String safeKey = sanitizeSearchKey(searchKey);

        // 매퍼 호출 시 type 파라미터 추가 전달
        List<FreeBoardDTO> lists = freeBoardMapper.getLists(
                start, end, safeKey, searchValue, category, type);
        
        // 데이터 개수 카운트 시에도 type 전달 (숨김 게시글 제외 카운트 목적)
        int dataCount = freeBoardMapper.getDataCount(safeKey, searchValue, category, type);

        Map<String, Object> result = new HashMap<>();
        result.put("lists",     lists);
        result.put("dataCount", dataCount);
        return result;
    }

    // ─── 상세 조회 + 조회수 증가 ────────────────────────────────────
    public FreeBoardDTO getReadData(Long boardId) throws Exception {
        freeBoardMapper.updateViewCount(boardId);
        return freeBoardMapper.getReadData(boardId);
    }

    // ─── 상세 조회 (조회수 증가 없음) ─────────────────
    public FreeBoardDTO getDataOnly(Long boardId) throws Exception {
        return freeBoardMapper.getReadData(boardId);
    }

    // ─── 작성 ────────────────────────────────────────────────────────
    public void insertData(FreeBoardDTO dto) throws Exception {
        freeBoardMapper.insertData(dto);
    }

    // ─── 카테고리별 쓰기 권한 검증 ─────────────────────────────────
    // guest 는 컨트롤러에서 별도 처리, 여기선 로그인 유저만 대상
    private static final Map<String, Set<String>> WRITE_PERMISSIONS = new HashMap<String, Set<String>>() {{
        put("user",    new HashSet<>(Arrays.asList("자유", "질문", "정보")));
        put("company", new HashSet<>(Arrays.asList("자유", "정보", "이벤트", "광고")));
        put("admin",   new HashSet<>(Arrays.asList("자유", "질문", "정보", "이벤트", "광고", "공지")));
    }};

    public void validateWritePermission(String category, String userType) {
        Set<String> allowed = WRITE_PERMISSIONS.get(userType);
        if (allowed == null || !allowed.contains(category)) {
            throw new RuntimeException("해당 카테고리에 글을 작성할 권한이 없습니다. (category=" + category + ", type=" + userType + ")");
        }
    }

    // ─── 수정 ────────────────────────────────────────
    public void updateData(FreeBoardDTO dto, String loggedInUserId, String userType) throws Exception {
        FreeBoardDTO existingPost = freeBoardMapper.getReadData(dto.getBoardId());

        if (existingPost == null) {
            throw new Exception("존재하지 않는 게시글입니다.");
        }

        // 관리자는 모든 게시글 수정 가능
        if (!"admin".equals(userType) && !existingPost.getUserId().equals(loggedInUserId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        freeBoardMapper.updateData(dto);
    }

    // ─── 삭제 ────────────────────────────
    @Transactional
    public void deleteData(Long boardId, String loggedInUserId, String userType) throws Exception {
        FreeBoardDTO existingPost = freeBoardMapper.getReadData(boardId);

        if (existingPost == null) {
            throw new Exception("존재하지 않는 게시글입니다.");
        }

        // 관리자는 모든 게시글 삭제 가능
        if (!"admin".equals(userType) && !existingPost.getUserId().equals(loggedInUserId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        freeBoardCommentMapper.deleteByBoardId(boardId);
        freeBoardMapper.deleteData(boardId);
    }

    // ─── 이전/다음 글 조회 ──────────────────────────────────────────
    public Map<String, Object> getNav(Long boardId) throws Exception {
        Map<String, Object> result = new HashMap<>();
        result.put("prev", freeBoardMapper.getPrev(boardId));
        result.put("next", freeBoardMapper.getNext(boardId));
        return result;
    }

    // ─── 좋아요 ──────────────────────────────────────────────────────
    public void updateLikeCount(Long boardId) throws Exception {
        freeBoardMapper.updateLikeCount(boardId);
    }

    // ─── [추가] 관리자용: 신고 게시글 목록 ──────────────────────────
    public List<FreeBoardDTO> getReportedPosts() throws Exception {
        return freeBoardMapper.getReportedPosts();
    }
}