package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.FurnitureDTO;
import com.spring.home.mapper.FurnitureMapper;

@Service
public class FurnitureService {

	@Autowired
	private FurnitureMapper furnitureMapper;
	
	public void insertData(FurnitureDTO dto) throws Exception{
		furnitureMapper.insertData(dto);
	}
	
	public List<FurnitureDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return furnitureMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public FurnitureDTO getReadData(int num) throws Exception{
		return furnitureMapper.getReadData(num);
	}
	
	public void updateData(FurnitureDTO dto) throws Exception{
		furnitureMapper.updateData(dto);
	}
	
	public void deleteData(int num) throws Exception{
		furnitureMapper.deleteData(num);
	}
}
