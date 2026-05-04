package com.spring.home.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class InvoiceDetailDTO {

    private String c_id;
    private String c_kind;
    private String c_name;
    
    private String id;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private Date b_createdDate;
    
    private int invoice_no;
    private String invoice_kind;
    
    private String invoice_text;
    private int invoice_qty;
    private int invoice_price;

}
