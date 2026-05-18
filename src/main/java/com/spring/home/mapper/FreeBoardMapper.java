package com.spring.home.mapper;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.spring.home.dto.FreeBoardDTO;

@Mapper
public interface FreeBoardMapper {

    // 게시글 등록
    public void insertData(FreeBoardDTO dto) throws Exception;

    // [수정] 페이징 + 검색 + 카테고리 + 유저타입(관리자여부) 포함 목록 조회
    public List<FreeBoardDTO> getLists(
            @Param("start")       int start,
            @Param("end")         int end,
            @Param("searchKey")   String searchKey,
            @Param("searchValue") String searchValue,
            @Param("category")    String category,
            @Param("type")        String type) throws Exception; // type 추가

    // 상세 조회 (조회수 증가 없이 데이터만)
    public FreeBoardDTO getReadData(@Param("boardId") Long boardId) throws Exception;

    // 게시글 수정
    public void updateData(FreeBoardDTO dto) throws Exception;

    // 게시글 삭제
    public void deleteData(@Param("boardId") Long boardId) throws Exception;

    // 조회수 증가
    public void updateViewCount(@Param("boardId") Long boardId) throws Exception;

    // 좋아요  on
    public void updateLikeCount(@Param("boardId") Long boardId) throws Exception;
    
    //좋아요 off
    public void unlikeCount(@Param("boardId") Long boardId) throws Exception;

    // 전체 데이터 개수 (유저 타입에 따라 숨김글 제외 카운트 위해 type 추가)
    public int getDataCount(
            @Param("searchKey")   String searchKey,
            @Param("searchValue") String searchValue,
            @Param("category")    String category,
            @Param("type")        String type) throws Exception; // type 추가

    // 이전글
    public FreeBoardDTO getPrev(@Param("boardId") Long boardId) throws Exception;

    // 다음글
    public FreeBoardDTO getNext(@Param("boardId") Long boardId) throws Exception;

    // ==========================================
    // 관리자 섹션
    // ==========================================

    // 1. 일괄 숨김 처리
    public void updateBatchHidden(Map<String, Object> map) throws Exception;

    // 2. 최신 작성 게시글 5개 조회
    public List<FreeBoardDTO> getLatestPosts() throws Exception;

    // 3. 좋아요 많은 게시글 5개 조회
    public List<FreeBoardDTO> getTopLikedPosts() throws Exception;

    // 4. 댓글 많은 게시글 5개 조회
    public List<FreeBoardDTO> getTopCommentedPosts() throws Exception;

    // 5. 신고된 게시글 리스트 조회
    public List<FreeBoardDTO> getReportedPosts() throws Exception;

    // 6. 신고된 게시글 총 개수
    public int getReportedPostsCount() throws Exception;
    
    // [추가 추천] 단일 게시글 숨김 상태 변경 메서드
    public void updateHiddenStatus(@Param("boardId") Long boardId, @Param("hidden") int hidden) throws Exception;
}