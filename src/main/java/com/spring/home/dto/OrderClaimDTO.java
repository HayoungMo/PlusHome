package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class OrderClaimDTO {

	private String claim_code;
	
	private String c_code;
	private String id;
	private String f_code;
	
	private int claim_type;
	private int claim_status;
	
	private String claim_reason;
	private Date claim_createddate;
	
	// 회사 
	private String c_id;
	private String c_name;
	
	// 가구 명
	private String f_name; 
}
