package com.spring.home.service;

import com.spring.home.dto.FreeBoardCommentDTO;
import com.spring.home.mapper.FreeBoardCommentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FreeBoardCommentService {

    @Autowired
    private FreeBoardCommentMapper commentMapper;

    /** 댓글 등록 */
    @Transactional
    public boolean insertComment(FreeBoardCommentDTO dto) {
        int result = commentMapper.insertComment(dto);
        if (result > 0) {
            commentMapper.increaseCommentCount(dto.getBoardId());
        }
        return result > 0;
    }

    /** 댓글 목록 조회 */
    public List<FreeBoardCommentDTO> getComments(Long boardId, String type) {
        return commentMapper.getCommentsByBoardId(boardId, type);
    }

    /** 단건 댓글 조회 */
    public FreeBoardCommentDTO getComment(Long commentId) {
        return commentMapper.getCommentById(commentId);
    }

    /**
     * 댓글 삭제 (에러 수정됨)
     */
    @Transactional
    public boolean deleteComment(Long boardId, Long commentId, String loginId, String userType) {
        FreeBoardCommentDTO comment = commentMapper.getCommentById(commentId);
        if (comment == null) return false;

        // [수정 포인트] getWriter() 대신 getUserId() 사용!
        if (loginId.equals(comment.getUserId()) || "admin".equals(userType)) {
            
            // 1) 대댓글 삭제
            int childRemoved = commentMapper.deleteByParentId(commentId);

            // 2) 댓글 본체 삭제
            int result = commentMapper.deleteComment(commentId);

            if (result > 0) {
                // commentCount 동기화
                int totalRemoved = result + childRemoved;
                for (int i = 0; i < totalRemoved; i++) {
                    commentMapper.decreaseCommentCount(boardId);
                }
                return true;
            }
        }
        return false;
    }

    /** 댓글 수정 */
    public boolean updateComment(FreeBoardCommentDTO dto) {
        return commentMapper.updateComment(dto) > 0;
    }

    /** 게시글 삭제 시 관련 댓글 전체 삭제 */
    @Transactional
    public int deleteAllByBoardId(Long boardId) {
        return commentMapper.deleteByBoardId(boardId);
    }
}