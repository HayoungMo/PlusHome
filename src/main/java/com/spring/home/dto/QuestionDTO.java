package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class QuestionDTO {

	public String id;
	public String f_code;
	public int q_idx;
	public String q_status;
	public String q_content;
	public Date q_createdDate;
	public String q_title;
	public String q_answer;
	public Date q_answerDate;
	public String q_secret;
	public String c_id;
	public String c_kind;
	public String c_name;
	public String f_name;
	
}
