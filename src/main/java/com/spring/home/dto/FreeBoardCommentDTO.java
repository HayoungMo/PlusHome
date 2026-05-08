package com.spring.home.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data

public class FreeBoardCommentDTO {
    
    private Long commentId;    // PK
    private Long boardId;      // FK (게시글 번호)
    private String userId;     // 작성자 ID
    private String userName;   // 작성자 이름
    private String userType;   // 작성자 타입 (USERS.TYPE: 'admin' / 'user') - 조회용 join 결과
    private String content;    // 댓글 내용
    private Long parentId;     // 대댓글용 부모 번호 (null 허용)
    
    // 리액트에서 가독성 좋은 포맷으로 전달하기 위해 설정
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}