package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class BookingDTO {

    private String Id;
    private Date Booking_created_date;
    private String C_id;
    private String C_kind;
    private String C_name;
    private String B_kind;
    private String B_long;
    private Date B_date;
    private String B_status;
    private String B_content;

}
