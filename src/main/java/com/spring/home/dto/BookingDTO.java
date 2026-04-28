package com.spring.home.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class BookingDTO {

    private String id;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date b_createdDate;
    
    private String c_id;
    private String c_kind;
    private String c_name;
    private String b_kind;
    private String b_long;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date b_date;
    
    private String b_status;
    private String b_content;

}
