package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.QuestionDTO;
import com.spring.home.mapper.QuestionMapper;

@Service
public class QuestionService {

	@Autowired
	private QuestionMapper questionMapper;
	
	public void insertData(QuestionDTO dto) throws Exception{
		if (dto.getQ_status() == null || dto.getQ_status().isEmpty()) {
			dto.setQ_status("received");
		}
		
		if (dto.getQ_secret() == null || dto.getQ_secret().isEmpty()) {
			dto.setQ_secret("N");
		}
		
		questionMapper.insertData(dto);
		
	}
	public List<QuestionDTO> getMyQuestions(String id) throws Exception {
		return questionMapper.getMyQuestions(id);
	}
	
	public List<QuestionDTO> getListsByFCode(String f_code) throws Exception{
		return questionMapper.getListsByFCode(f_code);
	}
	
	public QuestionDTO getReadDataByQIdx(int q_idx) throws Exception{
		return questionMapper.getReadDataByQIdx(q_idx);
	}
	
	public void updateAnswer(QuestionDTO dto) throws Exception{
		questionMapper.updateAnswer(dto);
	}
	
	public void updateData(QuestionDTO dto) throws Exception{
		questionMapper.updateData(dto);
	}
	
	//아이디로 삭제하면 안됨!!!!! -> 이 사람이 쓴 모든 글이 다 삭제됨
	public void deleteData(int q_idx) throws Exception{
		questionMapper.deleteData(q_idx);
	}
	
	//답변 관련
	public List<QuestionDTO> getCompanyQuestions(String c_id) throws Exception {
	    return questionMapper.getCompanyQuestions(c_id);
	}
	public void deleteAnswer(int q_idx) throws Exception {
	    questionMapper.deleteAnswer(q_idx);
	}


}
