package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.FurnitureDTO;

@Mapper
public interface FurnitureMapper {

	public void insertData(FurnitureDTO dto) throws Exception;
	
	public List<FurnitureDTO> getLists(int start, int end, String searchKey, String SearchValue) throws Exception;
	
	public FurnitureDTO getReadData(int num) throws Exception;
	
	public void updateData(FurnitureDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
}
