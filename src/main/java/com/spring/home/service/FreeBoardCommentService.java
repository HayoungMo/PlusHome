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


    @Transactional
    public boolean addComment(FreeBoardCommentDTO dto) {
       
        int result = commentMapper.insertComment(dto);

        if(result > 0) {
            commentMapper.increaseCommentCount(dto.getBoardId());
        }
        return result > 0;
    }

    public List<FreeBoardCommentDTO> getComments(Long boardId) {
        return commentMapper.getCommentsByBoardId(boardId);
    }

    // 단건 댓글 조회 (권한 체크용)
    public FreeBoardCommentDTO getComment(Long commentId) {
        return commentMapper.getCommentById(commentId);
    }


    @Transactional
    public boolean removeComment(Long boardId, Long commentId) {

        int result = commentMapper.deleteComment(commentId);

        if(result > 0) {
            commentMapper.decreaseCommentCount(boardId);
        }
        return result > 0;
    }

    public boolean modifyComment(FreeBoardCommentDTO dto) {
        return commentMapper.updateComment(dto) > 0;
    }
}