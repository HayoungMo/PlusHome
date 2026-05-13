package com.spring.home.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class InteriorReviewDTO {
    private String id;
    private String c_id;
    private String c_kind;
    private String c_name;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private Date b_createdDate;
    
    private int invoice_no;
    private String invoice_kind;
    
    private String ir_content;
    private String ir_createdDate;
    
    private String c_addr;
    private String c_phone;
    private String c_email;
    private String c_content;

}
