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
	private String f_name;
	private int fr_idx;
	private String c_id;
	private String c_code;
	private int payment;
	private int usedPoint;
	private int qty;
}
