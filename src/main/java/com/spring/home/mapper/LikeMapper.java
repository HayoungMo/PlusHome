package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.LikeDTO;

@Mapper
public interface LikeMapper {

	public void insertData(LikeDTO dto) throws Exception;
	
	public List<LikeDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public LikeDTO getReadData(String id) throws Exception;
	
	public void updateData(LikeDTO dto) throws Exception;
	
	public void deleteData(String id) throws Exception;
}
