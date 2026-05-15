package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.QuestionDTO;

@Mapper
public interface QuestionMapper {

	public void insertData(QuestionDTO dto) throws Exception;
	
	public List<QuestionDTO> getListsByFCode(@Param("f_code") String f_code) throws Exception;
	
	public List<QuestionDTO> getMyQuestions(@Param("id") String id) throws Exception;
	
	public List<QuestionDTO> getCompanyQuestions(String c_id) throws Exception;
	
	public QuestionDTO getReadDataByQIdx(@Param("q_idx") int q_idx) throws Exception;
	
	public void updateAnswer(QuestionDTO dto) throws Exception;
	
	public void deleteAnswer(@Param("q_idx") int q_idx) throws Exception;
	
	public void updateData(QuestionDTO dto) throws Exception;
	
	public void deleteData(@Param("q_idx") int q_idx) throws Exception;
}
