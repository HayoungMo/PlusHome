package com.spring.home.mapper;

import com.spring.home.dto.FreeBoardCommentDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface FreeBoardCommentMapper {

    // 1. 댓글 등록
    int insertComment(FreeBoardCommentDTO dto);

    // 2. 특정 게시글 댓글 목록 조회 (수정 완료!)

    List<FreeBoardCommentDTO> getCommentsByBoardId(
        @Param("boardId") Long boardId, 
        @Param("type") String type
    );

    // 3. 단건 댓글 조회 (권한 체크용)
    FreeBoardCommentDTO getCommentById(@Param("commentId") Long commentId);

    // 4. 댓글 삭제
    int deleteComment(@Param("commentId") Long commentId);

    // 5. 댓글 수정
    int updateComment(FreeBoardCommentDTO dto);

    // 6. 댓글 수 증가/감소 (게시글 테이블의 COMMENTCOUNT 업데이트용)
    int increaseCommentCount(@Param("boardId") Long boardId);
    int decreaseCommentCount(@Param("boardId") Long boardId);

    // 7. 게시글 삭제 시 모든 댓글 삭제
    int deleteByBoardId(@Param("boardId") Long boardId);

    // 8. 부모 댓글 삭제 시 대댓글 삭제
    int deleteByParentId(@Param("parentId") Long parentId);
}