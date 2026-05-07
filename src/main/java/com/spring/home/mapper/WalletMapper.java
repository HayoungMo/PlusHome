package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.WalletDTO;

@Mapper
public interface WalletMapper {

	public void insertData(WalletDTO dto) throws Exception;
	
	public List<WalletDTO> getLists(@Param("start") int start, 
			@Param("end") int end, @Param("searchKey") String searchKey, 
			@Param("searchValue") String searchValue) throws Exception;
	
	public WalletDTO getReadData(String id) throws Exception;
	
	public void updateData(WalletDTO dto) throws Exception;
	
	public void deleteData(String id) throws Exception;
}
