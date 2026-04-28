package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class BookingDTO {

    private String id;
    private Date b_createdDate;
    private String c_id;
    private String c_kind;
    private String c_name;
    private String b_kind;
    private String b_long;
    private Date b_date;
    private String b_status;
    private String b_content;

}
