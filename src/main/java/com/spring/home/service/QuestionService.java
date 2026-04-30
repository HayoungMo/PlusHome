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
		questionMapper.insertData(dto);
	}
	
	public List<QuestionDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return questionMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public QuestionDTO getReadDataById(String id) throws Exception{
		return questionMapper.getReadDataById(id);
	}
	
	public QuestionDTO getReadDataByFCode(String f_code) throws Exception{
		return questionMapper.getReadDataByFCode(f_code);
	}
	
	public QuestionDTO getReadDataByQIdx(String q_idx) throws Exception{
		return questionMapper.getReadDataByQIdx(q_idx);
	}

		public void updateData(QuestionDTO dto) throws Exception{
		questionMapper.updateData(dto);
	}
	
	//아이디로 삭제하면 안됨!!!!! -> 이 사람이 쓴 모든 글이 다 삭제됨
	public void deleteData(String q_idx) throws Exception{
		questionMapper.deleteData(q_idx);
	}
}
