package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.UserDTO;

@Mapper
public interface MypageMapper {

	public void insertData(UserDTO dto) throws Exception;
	
	public List<UserDTO> getList(int start, int end, String searchKey,String searchValue) throws Exception;
	
	public UserDTO getReadData(int num) throws Exception;
	
	public void updateData(UserDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
	
}