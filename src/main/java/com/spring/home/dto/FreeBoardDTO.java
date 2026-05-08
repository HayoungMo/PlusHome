package com.spring.home.dto;

import lombok.Data;

@Data
public class FreeBoardDTO {
    private Long boardId;
    private String userId;
    private String userName;
    private String category;
    private String title;
    private String content;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private String createdAt;
    private String updatedAt;
}