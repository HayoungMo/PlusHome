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
	
	//MyBatis update는 수정된 행 수를 int로 받을수 있다. 답변 달린 문의라서 수정여부를 확인하기 위해서
	public int updateData(QuestionDTO dto) throws Exception;
	
	public void deleteData(@Param("q_idx") int q_idx) throws Exception;
	//자회사 상품페이지 문의 답변 금지 백엔드
	public int isMyCompanyFurniture(@Param("id") String id, @Param("f_code") String f_code);
}
