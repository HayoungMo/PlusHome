package com.spring.home.dto;

import lombok.Data;

@Data
public class ResponseIdDTO {
	
	private boolean success;
	private String message;
	private String id;

}
