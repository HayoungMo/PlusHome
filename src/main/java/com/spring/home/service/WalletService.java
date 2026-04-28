package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.WalletDTO;
import com.spring.home.mapper.WalletMapper;

@Service
public class WalletService {

	@Autowired
	private WalletMapper walletMapper;

	public void insertData(WalletDTO dto) throws Exception{
		walletMapper.insertData(dto);
	}
	
	public List<WalletDTO> getLists(int start, int end, String searchKey, String SearchValue) throws Exception{
		return walletMapper.getLists(start, end, searchKey, SearchValue);
	}
	
	public WalletDTO getReadData(int num) throws Exception{
		return walletMapper.getReadData(num);
	}
	
	public void updateData(WalletDTO dto) throws Exception{
		walletMapper.updateData(dto);
	}
	
	public void deleteData(int num) throws Exception{
		walletMapper.deleteData(num);
	}
	
}
