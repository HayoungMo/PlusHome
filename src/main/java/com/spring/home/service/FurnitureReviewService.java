package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.FurnitureReviewDTO;
import com.spring.home.mapper.FurnitureReviewMapper;

@Service
public class FurnitureReviewService {

	@Autowired
	private FurnitureReviewMapper furnitureReviewMapper;
	
	public void insertData(FurnitureReviewDTO dto) throws Exception{
		furnitureReviewMapper.insertData(dto);
	}
	
	public List<FurnitureReviewDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return furnitureReviewMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public FurnitureReviewDTO getReadDataById(String id) throws Exception{
		return furnitureReviewMapper.getReadDataById(id);
	}

	public FurnitureReviewDTO getReadDataByFCode(String f_code) throws Exception{
		return furnitureReviewMapper.getReadDataByFCode(f_code);
	}
	public void updateData(FurnitureReviewDTO dto) throws Exception{
		furnitureReviewMapper.updateData(dto);
	}
	
	public void deleteData(String id) throws Exception{
		furnitureReviewMapper.deleteData(id);
	}
}
