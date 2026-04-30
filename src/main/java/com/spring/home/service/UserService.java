package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.UserDTO;
import com.spring.home.mapper.UserMapper;

@Service
public class UserService {

	@Autowired
	private UserMapper userMapper;
	
	
	public void insertData(UserDTO dto) throws Exception{
		userMapper.insertData(dto);
	}
	
	public List<UserDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return userMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public UserDTO getReadData(String id) throws Exception{
		return userMapper.getReadData(id);
	}
	
	public void updateData(UserDTO dto) throws Exception{
		userMapper.updateData(dto);
	}
	
	public void deleteData(String id) throws Exception{
		userMapper.deleteData(id);
	}
	
	public UserDTO login(UserDTO dto) throws Exception {
		return userMapper.login(dto);		
		
	}
	
	public UserDTO findById(String id) throws Exception{
		return userMapper.findById(id);
	}
	
	
		
	public String findUserId(UserDTO dto) throws Exception {
		return userMapper.findUserId(dto);
	}
}
	
	

