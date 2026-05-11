package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.OptionsDTO;
import com.spring.home.mapper.OptionsMapper;
import com.spring.home.util.furnitureCode;

@Service
public class OptionsService {

	@Autowired
	private OptionsMapper optionsMapper;
	
	public void insertData(OptionsDTO dto) throws Exception{
		if(dto.getO_code() == null || dto.getO_code().trim().isEmpty())
			dto.setO_code(furnitureCode.generateOptionCode());

		optionsMapper.insertData(dto);
	}
	
	public List<OptionsDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return optionsMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public OptionsDTO getReadData(String f_code) throws Exception{
		return optionsMapper.getReadData(f_code);
	}
	
	public void updateData(OptionsDTO dto) throws Exception{
		optionsMapper.updateData(dto);
	}
	
	public void deleteData(String f_code) throws Exception{
		optionsMapper.deleteData(f_code);
	}
	
	public void deleteOne(String o_code) throws Exception{
		optionsMapper.deleteData(o_code);
	}
	
	public List<OptionsDTO> getListByFcode(String f_code) throws Exception{
		return optionsMapper.getListByFcode(f_code);
	}
}
