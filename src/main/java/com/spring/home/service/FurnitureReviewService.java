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
	
	public List<FurnitureReviewDTO> getLists(FurnitureReviewDTO dto) throws Exception{
		return furnitureReviewMapper.getLists(dto);
	}	

	public void updateData(FurnitureReviewDTO dto) throws Exception{
		furnitureReviewMapper.updateData(dto);
	}
	
	public void deleteData(FurnitureReviewDTO dto) throws Exception{
		furnitureReviewMapper.deleteData(dto);
	}

	public void insertReplyData(FurnitureReviewDTO dto) throws Exception{
		furnitureReviewMapper.insertReplyData(dto);
	}
}
