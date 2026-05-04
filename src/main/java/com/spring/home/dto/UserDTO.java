package com.spring.home.dto;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;

@Data
public class UserDTO {
	private String id;
	private String pw; 
	private String type;
	private String code;
	private String name;
	private String email;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private Date birth;
	private String tel;
	private String gender;
	private String addr;
	
	private CompanyDTO companyDto;

	
}
