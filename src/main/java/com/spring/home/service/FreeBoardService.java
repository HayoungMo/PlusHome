package com.spring.home.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.spring.home.dto.FreeBoardDTO;
import com.spring.home.mapper.FreeBoardMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FreeBoardService {

    private final FreeBoardMapper freeBoardMapper;

    private static final int PAGE_SIZE = 8; // ListPage의 disabled 조건과 동일

    // SQL Injection 방지: 검색 가능한 컬럼 화이트리스트
    private static final Set<String> ALLOWED_SEARCH_KEYS =
            new HashSet<>(Arrays.asList("title", "userName", "content"));

    private String sanitizeSearchKey(String searchKey) {
        if (searchKey == null || !ALLOWED_SEARCH_KEYS.contains(searchKey)) {
            return "title";
        }
        return searchKey;
    }

    // ─── 목록 조회 + 페이징 ──────────────────────────────────────────
    public Map<String, Object> getLists(int pageNum, String searchKey,
                                        String searchValue, String category) throws Exception {
        if (pageNum < 1) pageNum = 1;
        int start = (pageNum - 1) * PAGE_SIZE + 1;
        int end   = pageNum * PAGE_SIZE;

        String safeKey = sanitizeSearchKey(searchKey);

        List<FreeBoardDTO> lists = freeBoardMapper.getLists(
                start, end, safeKey, searchValue, category);
        int dataCount = freeBoardMapper.getDataCount(safeKey, searchValue, category);

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

    // ─── 상세 조회 (조회수 증가 없음, 권한 검사용) ─────────────────
    public FreeBoardDTO getDataOnly(Long boardId) throws Exception {
        return freeBoardMapper.getReadData(boardId);
    }

    // ─── 작성 ────────────────────────────────────────────────────────
    public void insertData(FreeBoardDTO dto) throws Exception {
        freeBoardMapper.insertData(dto);
    }
 // ─── 수정 (본인 확인 로직 추가) ────────────────────────────────────────
    public void updateData(FreeBoardDTO dto, String loggedInUserId) throws Exception {
        // 1. 기존 게시글 정보를 가져와서 작성자 확인
        FreeBoardDTO existingPost = freeBoardMapper.getReadData(dto.getBoardId());
        
        if (existingPost == null) {
            throw new Exception("존재하지 않는 게시글입니다.");
        }

        // 2. 로그인한 유저 아이디와 작성자 아이디 비교
        if (!existingPost.getUserId().equals(loggedInUserId)) {
            throw new Exception("수정 권한이 없습니다.");
        }

        freeBoardMapper.updateData(dto);
    }

    // ─── 삭제 (본인 확인 로직 추가) ────────────────────────────────────────
    public void deleteData(Long boardId, String loggedInUserId) throws Exception {
        // 1. 기존 게시글 정보를 가져와서 작성자 확인
        FreeBoardDTO existingPost = freeBoardMapper.getReadData(boardId);

        if (existingPost == null) {
            throw new Exception("존재하지 않는 게시글입니다.");
        }

        // 2. 권한 확인 (관리자라면 무조건 통과시키거나, 본인일 때만 허용)
        if (!existingPost.getUserId().equals(loggedInUserId)) {
            throw new Exception("삭제 권한이 없습니다.");
        }

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
}
