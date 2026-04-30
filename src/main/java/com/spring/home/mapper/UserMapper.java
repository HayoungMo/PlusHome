package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.UserDTO;

@Mapper
public interface UserMapper {

	public void insertData(UserDTO dto) throws Exception;
	
	public List<UserDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public UserDTO getReadData(String id) throws Exception;
	
	public void updateData(UserDTO dto) throws Exception;
	
	public void deleteData(String id) throws Exception;
}
