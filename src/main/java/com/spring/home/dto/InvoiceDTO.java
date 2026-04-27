package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class InvoiceDTO {

    private String C_id;
    private String C_kind;
    private String C_name;
    
    private String Id;
    
    private Date B_date;
    
    private int Invoice_no;
    private String Invoice_kind;
    private String Invoice_text;
    private int Invoice_price;

}
