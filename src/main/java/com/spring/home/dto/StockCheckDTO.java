package com.spring.home.dto;

import java.util.List;

import lombok.Data;

@Data
public class StockCheckDTO {

	private List<String> c_codes;
	
	private String c_code;
	private String f_code;
	private String productName;
	private String type;
	
	private String optionName;
	private String optionValue;
	
	private int requestedCount;
	private int stock;
	private String message;


}
