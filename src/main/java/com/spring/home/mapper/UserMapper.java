package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.RequestBody;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.UserDTO;

import groovy.transform.Undefined.EXCEPTION;
//
@Mapper
public interface UserMapper {

	public void insertData(UserDTO dto) throws Exception;
	
	public List<UserDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public UserDTO getReadData(String id) throws Exception;
	
	public void updateData(UserDTO dto) throws Exception;
	
	public void deleteData(String id) throws Exception;
	
	public UserDTO login(UserDTO dto) throws Exception;
	
	public UserDTO findById(String id) throws Exception;
	
	public String findUserId(UserDTO dto) throws Exception;
	
	public UserDTO findUserPw(UserDTO dto) throws Exception;
	
	public void  updatePw(@Param("id") String id,
            @Param("pw") String pw) throws Exception;
	
	public void insertCompany(CompanyDTO dto) throws Exception;
	
	public void updateMyPageUser(UserDTO dto) throws Exception;
	
	public void deleteUser(UserDTO dto) throws Exception;
	
	public List<UserDTO> getUserListDev(UserDTO dto);
	
	public int deleteUserDev(UserDTO dto) throws Exception;
	
	public int restoreUserDev(UserDTO dto) throws Exception;
	
	public int updateUserDev(UserDTO dto) throws Exception;
	
	public int updateCompanyDev(CompanyDTO cdto) throws Exception;
	
}
