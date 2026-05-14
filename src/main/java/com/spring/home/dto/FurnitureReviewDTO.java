package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class FurnitureReviewDTO {

	private String id;
	private String f_code;
	private String fr_subject;
	private String fr_star;
	private Date fr_createdDate;
	private String fr_content;

	private String c_code;
}
