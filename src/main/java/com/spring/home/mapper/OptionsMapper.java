package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.OptionsDTO;

@Mapper
public interface OptionsMapper {
	
	public void insertData(OptionsDTO dto) throws Exception;
	
	public List<OptionsDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public OptionsDTO getReadData(int num) throws Exception;
	
	public void updateData(OptionsDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
}
