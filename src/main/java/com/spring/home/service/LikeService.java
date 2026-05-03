package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.LikeDTO;
import com.spring.home.mapper.LikeMapper;

@Service
public class LikeService {

	@Autowired
	private LikeMapper likeMapper;
	
	public void insertData(LikeDTO dto) throws Exception{
		likeMapper.insertData(dto);
	}
	
	public List<LikeDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return likeMapper.getLists(start, end, searchKey, searchValue);
	}
	public LikeDTO getReadData(String id) throws Exception{
		return likeMapper.getReadData(id);
	}
	
	public void updateData(LikeDTO dto) throws Exception{
		likeMapper.updateData(dto);
	}
	
	public void deleteData(String id) throws Exception{
		likeMapper.deleteData(id);
	}
}
