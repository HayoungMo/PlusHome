package com.spring.home.dto;

import lombok.Data;

@Data
public class OrderClaimUpdateDTO {

	private String claim_code;
	private int claim_type;
	private int claim_status;
}
