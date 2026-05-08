package com.spring.home.mapper;

import com.spring.home.dto.FreeBoardCommentDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FreeBoardCommentMapper {

    // 댓글 등록
    int insertComment(FreeBoardCommentDTO dto);

    // 특정 게시글 댓글 목록 조회
    List<FreeBoardCommentDTO> getCommentsByBoardId(Long boardId);

    // 단건 댓글 조회 (권한 체크용)
    FreeBoardCommentDTO getCommentById(Long commentId);

    // 댓글 삭제
    int deleteComment(Long commentId);

    // 댓글 수정
    int updateComment(FreeBoardCommentDTO dto);

    // 댓글 수 증가
    int increaseCommentCount(Long boardId);

    // 댓글 수 감소
    int decreaseCommentCount(Long boardId);

}