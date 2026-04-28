package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class InvoiceDTO {

    private String c_id;
    private String c_kind;
    private String c_name;
    
    private String id;
    
    private Date b_date;
    
    private int invoice_no;
    private String invoice_kind;
    private String invoice_text;
    private int invoice_price;

}
