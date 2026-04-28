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
	
	public List<QuestionDTO> getLists(int start, int end, String searchKey, String SearchValue) throws Exception{
		return questionMapper.getLists(start, end, searchKey, SearchValue);
	}
	
	public QuestionDTO getReadData(int num) throws Exception{
		return questionMapper.getReadData(num);
	}
	
	public void updateData(QuestionDTO dto) throws Exception{
		questionMapper.updateData(dto);
	}
	
	public void deleteData(int num) throws Exception{
		questionMapper.deleteData(num);
	}
}
