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

    /** 페이지당 게시글 수 (controller의 totalPage 계산에도 사용) */
    public static final int PAGE_SIZE = 8;

    private static final Set<String> ALLOWED_SEARCH_KEYS =
            new HashSet<>(Arrays.asList("title", "userName", "content"));

    private String sanitizeSearchKey(String searchKey) {
        if (searchKey == null || !ALLOWED_SEARCH_KEYS.contains(searchKey)) {
            return "title";
        }
        return searchKey;
    }

    // -- 목록 조회 + 페이징 (날짜 범위 검색 포함)
    public Map<String, Object> getLists(int pageNum, String searchKey,
                                        String searchValue, String category, String type,
                                        String startDate, String endDate) throws Exception {
        if (pageNum < 1) pageNum = 1;
        int start = (pageNum - 1) * PAGE_SIZE + 1;
        int end   = pageNum * PAGE_SIZE;

        String safeKey = sanitizeSearchKey(searchKey);

        List<FreeBoardDTO> lists = freeBoardMapper.getLists(
                start, end, safeKey, searchValue, category, type, startDate, endDate);

        int dataCount = freeBoardMapper.getDataCount(
                safeKey, searchValue, category, type, startDate, endDate);

        Map<String, Object> result = new HashMap<>();
        result.put("lists",     lists);
        result.put("dataCount", dataCount);
        return result;
    }

    // -- 게시글 단건 조회 (조회수 증가 없음)
    public FreeBoardDTO getDataOnly(Long boardId) throws Exception {
        return freeBoardMapper.getReadData(boardId);
    }

    // -- 조회수 증가
    @Transactional
    public void incrementViewCount(Long boardId) throws Exception {
        freeBoardMapper.updateViewCount(boardId);
    }

    // -- 이전글 / 다음글 내비게이션
    public Map<String, FreeBoardDTO> getNav(Long boardId) throws Exception {
        Map<String, FreeBoardDTO> nav = new HashMap<>();
        nav.put("prev", freeBoardMapper.getPrev(boardId));
        nav.put("next", freeBoardMapper.getNext(boardId));
        return nav;
    }

    // -- 게시글 작성
    public void insertData(FreeBoardDTO dto) throws Exception {
        freeBoardMapper.insertData(dto);
    }

    // -- 카테고리별 작성 권한 정의 (유니코드 한글 변환 완료)
    private static final Map<String, Set<String>> WRITE_PERMISSIONS;
    static {
        WRITE_PERMISSIONS = new HashMap<>();
        WRITE_PERMISSIONS.put("user",    new HashSet<>(Arrays.asList("자유", "질문", "정보")));
        WRITE_PERMISSIONS.put("company", new HashSet<>(Arrays.asList("자유", "정보", "이벤트", "광고")));
        WRITE_PERMISSIONS.put("admin",   new HashSet<>(Arrays.asList("자유", "질문", "정보", "이벤트", "광고", "공지")));
    }

    public void validateWritePermission(String category, String userType) {
        Set<String> allowed = WRITE_PERMISSIONS.get(userType);
        if (allowed == null || !allowed.contains(category)) {
            throw new RuntimeException(
                "해당 카테고리에 대한 작성 권한이 없습니다. (category=" + category + ", type=" + userType + ")");
        }
    }

    // -- 게시글 수정
    @Transactional
    public void updateData(FreeBoardDTO dto, String loggedInUserId, String userType) throws Exception {
        FreeBoardDTO existingPost = freeBoardMapper.getReadData(dto.getBoardId());
        if (existingPost == null) {
            throw new Exception("존재하지 않는 게시글입니다.");
        }
        if (!"admin".equals(userType) && !existingPost.getUserId().equals(loggedInUserId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }
        freeBoardMapper.updateData(dto);
    }

    // -- 좋아요 on
    @Transactional
    public void updateLikeCount(Long boardId) throws Exception {
        freeBoardMapper.updateLikeCount(boardId);
    }

    // -- 좋아요 off
    @Transactional
    public void unlikeCount(Long boardId) throws Exception {
        freeBoardMapper.unlikeCount(boardId);
    }

    // -- 게시글 삭제 (댓글 먼저 삭제 -> orphan 방지)
    @Transactional
    public void deleteData(Long boardId, String loggedInUserId, String userType) throws Exception {
        FreeBoardDTO existingPost = freeBoardMapper.getReadData(boardId);
        if (existingPost == null) {
            throw new Exception("존재하지 않는 게시글입니다.");
        }
        if (!"admin".equals(userType) && !existingPost.getUserId().equals(loggedInUserId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        freeBoardCommentMapper.deleteByBoardId(boardId);
        freeBoardMapper.deleteData(boardId);
    }
}