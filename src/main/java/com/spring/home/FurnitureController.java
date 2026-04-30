package com.spring.home;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.FurnitureDTO;
import com.spring.home.service.FurnitureService;
import com.spring.home.service.UserService;

import lombok.RequiredArgsConstructor;

@RequestMapping("/furniture")
@RestController
public class FurnitureController {

	@Resource
	private FurnitureService furnitureService;
	
	@GetMapping("/list")
	public List<FurnitureDTO> getLists(
			@RequestParam(defaultValue="1") int pageNum,
			@RequestParam(defaultValue = "f_name") String searchKey,
			@RequestParam(defaultValue = "") String searchValue) throws Exception{
		
		int numPerPage = 5;
		int start = (pageNum -1) * numPerPage + 1;
		int end = pageNum * numPerPage;
		
		return furnitureService.getLists(start, end, searchKey, searchValue);
		
	}
	
	@GetMapping("/list/item")
	public FurnitureDTO getReadData(@RequestParam String f_code) throws Exception {
		return furnitureService.getReadData(f_code);
	}
	
	@PostMapping("/add")
	public void insertData(@RequestBody FurnitureDTO dto) throws Exception{
		furnitureService.insertData(dto);
	}
	
	@PostMapping("/update")
	public void updateData(@RequestBody FurnitureDTO dto) throws Exception{
		furnitureService.updateData(dto);
	}
	
	@GetMapping("/delete")
	public void deleteData(String f_code) throws Exception{
		furnitureService.deleteData(f_code);
	}
	
}
