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
	
	public List<WalletDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return walletMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public WalletDTO getReadData(String id) throws Exception{
		return walletMapper.getReadData(id);
	}
	
	public void updateData(WalletDTO dto) throws Exception {
	    if (dto.getMoney() <= 0) {
	        throw new IllegalArgumentException("충전 금액은 0보다 커야합니다.");
	    }

	    WalletDTO wallet = walletMapper.getReadData(dto.getId());

	    if (wallet == null) {
	        WalletDTO newWallet = new WalletDTO();
	        newWallet.setId(dto.getId());
	        newWallet.setMoney(0);

	        walletMapper.insertData(newWallet);
	    }

	    walletMapper.updateData(dto);
	}

	
	public void deleteData(String id) throws Exception{
		walletMapper.deleteData(id);
	}
	
}
