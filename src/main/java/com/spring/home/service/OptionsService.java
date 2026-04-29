package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.OptionsDTO;
import com.spring.home.mapper.OptionsMapper;

@Service
public class OptionsService {

	@Autowired
	private OptionsMapper optionsMapper;
	
	public void insertData(OptionsDTO dto) throws Exception{
		optionsMapper.insertData(dto);
	}
	
	public List<OptionsDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return optionsMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public OptionsDTO getReadData(int num) throws Exception{
		return optionsMapper.getReadData(num);
	}
	
	public void updateData(OptionsDTO dto) throws Exception{
		optionsMapper.updateData(dto);
	}
	
	public void deleteData(int num) throws Exception{
		optionsMapper.deleteData(num);
	}
}
