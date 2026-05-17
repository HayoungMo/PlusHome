package com.spring.home.dto;

import java.util.Date;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;
//
@Data
public class UserDTO {
	private String id;
	private String pw; 
	private String type;
	private String code;
	private String name;
	private String email;
	
	private String c_kind;
	private String c_info;
	private String c_boss;
	private String c_name;
	private String c_addr;
	
	
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private Date birth;
	private String tel;
	private String gender;
	private String addr;
	private String joined;
	
	private CompanyDTO companyDto;

	private List<CompanyDTO> companyList;
}
