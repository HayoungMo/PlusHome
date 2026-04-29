package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.QuestionDTO;

@Mapper
public interface QuestionMapper {

	public void insertData(QuestionDTO dto) throws Exception;
	
	public List<QuestionDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public QuestionDTO getReadData(int num) throws Exception;
	
	public void updateData(QuestionDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
}
