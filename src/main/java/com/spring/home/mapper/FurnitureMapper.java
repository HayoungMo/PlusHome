package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.FurnitureDTO;

@Mapper
public interface FurnitureMapper {

	public int countByFCode(String f_code);
	
	public void insertData(FurnitureDTO dto) throws Exception;
	
	public List<FurnitureDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public FurnitureDTO getReadData(String f_code) throws Exception;
	
	public void updateData(FurnitureDTO dto) throws Exception;
	
	public void deleteData(String f_code) throws Exception;
}
