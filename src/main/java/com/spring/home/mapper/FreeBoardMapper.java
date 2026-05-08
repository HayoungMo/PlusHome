package com.spring.home.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.spring.home.dto.FreeBoardDTO;

@Mapper
public interface FreeBoardMapper {

    // 게시글 등록
    public void insertData(FreeBoardDTO dto) throws Exception;

    // 페이징 + 검색 포함 목록 조회
    public List<FreeBoardDTO> getLists(
            @Param("start")       int start,
            @Param("end")         int end,
            @Param("searchKey")   String searchKey,
            @Param("searchValue") String searchValue,
            @Param("category")    String category) throws Exception;

    // 상세 조회 (조회수 증가 없이 데이터만)
    public FreeBoardDTO getReadData(@Param("boardId") Long boardId) throws Exception;

    // 게시글 수정
    public void updateData(FreeBoardDTO dto) throws Exception;

    // 게시글 삭제
    public void deleteData(@Param("boardId") Long boardId) throws Exception;

    // 조회수 증가
    public void updateViewCount(@Param("boardId") Long boardId) throws Exception;

    // 좋아요 수 증가
    public void updateLikeCount(@Param("boardId") Long boardId) throws Exception;

    // 전체 데이터 개수 (페이징용)
    public int getDataCount(
            @Param("searchKey")   String searchKey,
            @Param("searchValue") String searchValue,
            @Param("category")    String category) throws Exception;

    // 이전글 (boardId, title만 채워서 반환, 없으면 null)
    public FreeBoardDTO getPrev(@Param("boardId") Long boardId) throws Exception;

    // 다음글 (boardId, title만 채워서 반환, 없으면 null)
    public FreeBoardDTO getNext(@Param("boardId") Long boardId) throws Exception;
}
