package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.QuestionDTO;

@Mapper
public interface QuestionMapper {

	public void insertData(QuestionDTO dto) throws Exception;
	
	public List<QuestionDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public QuestionDTO getReadDataById(String id) throws Exception;
	public QuestionDTO getReadDataByFCode(String f_code) throws Exception;
	public QuestionDTO getReadDataByQIdx(String q_idx) throws Exception;
	
	public void updateData(QuestionDTO dto) throws Exception;
	
	public void deleteData(String q_idx) throws Exception;
}
