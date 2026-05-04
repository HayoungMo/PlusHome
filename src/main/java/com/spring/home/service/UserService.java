package com.spring.home.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.UserDTO;
import com.spring.home.mapper.CompanyMapper;
import com.spring.home.mapper.UserMapper;

@Service
public class UserService {

	@Autowired
	private UserMapper userMapper;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	private CompanyMapper companyMapper;
	
	@Transactional
	public void insertUser(UserDTO dto) throws Exception{
		
		String encodePw = passwordEncoder.encode(dto.getPw());
		dto.setPw(encodePw);
		
		userMapper.insertData(dto);	
		
		System.out.println("=== 회원가입 디버깅 ===");
		System.out.println("type: " + dto.getType());
		System.out.println("cDto null 여부: " + (dto.getCompanyDto() == null));
		System.out.println("cDto 내용: " + dto.getCompanyDto());
		
		if("company".equals(dto.getType())&&dto.getCompanyDto() !=null) {
			CompanyDTO cdto = dto.getCompanyDto();
			cdto.setC_id(dto.getId());
			companyMapper.insertData(cdto);
		}
		
		
		
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
		
		UserDTO user = userMapper.findById(dto.getId());
		
		if(user==null) {
			return null;
		}
		
		if (passwordEncoder.matches(dto.getPw(), user.getPw())) {
			return user;
			
		}
		
		return null;	
		
	}
	
	public UserDTO findById(String id) throws Exception{
		return userMapper.findById(id);
	}	
	
		
	public String findUserId(UserDTO dto) throws Exception {
		return userMapper.findUserId(dto);
	}
	
	
	
}
	
	

