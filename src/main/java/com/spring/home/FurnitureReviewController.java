package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	
	@GetMapping("/check")
	public ResponseEntity<?> checkReview(@RequestParam String c_code) throws Exception {
	    FurnitureReviewDTO review = furnitureReviewService.getReviewByCartCode(c_code);

	    Map<String, Object> result = new HashMap<>();
	    result.put("reviewed", review != null);

	    return ResponseEntity.ok(result);
	}


}
