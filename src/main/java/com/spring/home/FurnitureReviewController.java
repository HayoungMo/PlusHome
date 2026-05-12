package com.spring.home;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.FurnitureReviewDTO;
import com.spring.home.service.FurnitureReviewService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/freview")
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class FurnitureReviewController {
	
	@Resource
	private FurnitureReviewService furnitureReviewService;
	
	@PostMapping("/insert")
	public void insertData(@RequestBody FurnitureReviewDTO dto) throws Exception{
		System.out.println(dto);
		furnitureReviewService.insertData(dto);
	}
	@PostMapping("/getLists")
	public List<FurnitureReviewDTO> getLists(@RequestBody FurnitureReviewDTO dto) throws Exception{
		return furnitureReviewService.getLists(dto);
	}

	@PostMapping("/update")
	public void updateData(@RequestBody FurnitureReviewDTO dto) throws Exception{
		furnitureReviewService.updateData(dto);
	}
	@PostMapping("/delete")
	public void deleteData(@RequestBody FurnitureReviewDTO dto) throws Exception{
		furnitureReviewService.deleteData(dto);
	}

}
