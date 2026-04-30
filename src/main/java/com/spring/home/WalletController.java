package com.spring.home;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.WalletDTO;
import com.spring.home.service.WalletService;

import lombok.RequiredArgsConstructor;

@RequestMapping("/wallet")
@RestController
public class WalletController {

	@Autowired
	private WalletService walletService;
	
	@GetMapping("/list")
	public List<WalletDTO> getLists(
			@RequestParam(defaultValue = "1") int pageNum,
			@RequestParam(defaultValue = "f_name") String searchKey,
			@RequestParam(defaultValue = "") String searchValue) throws Exception{
						
		int numPerPage = 5;
		int start = (pageNum -1) * numPerPage +1;
		int end = pageNum * numPerPage;
		return walletService.getLists(start, end, searchKey, searchValue);
	}
			
			
	
//	@GetMapping("/charge")
//	public insertData
	
	
}
