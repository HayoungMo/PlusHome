package com.spring.home;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.FurnitureDTO;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.service.HomeService;

@RequestMapping("/main")
@RestController
public class HomeController {

	
	 //DB랑 연결해서 쓸때
     @Autowired
     private HomeService homeService;
     
     @GetMapping("/best")
     public List<FurnitureDTO> getBestFurniture() throws Exception {
	     
		return homeService.getBestFurniture();
	}
     
     @GetMapping("/search/total")
     public Map<String, Object> searchTotal(@RequestParam String keyword) throws Exception{
    	 return homeService.searchTotal(keyword);
     }

}












//	@GetMapping("/testService")
//	public String testServiceGet(@RequestParam("text") String text) {
//		System.out.println("GET 프론트에서 받은 데이터 : " + text);
//
//		return "GET 프론트에서 받은 데이터 : " + text;
//	}
//
//	@PostMapping("/testService")
//	public String testServicePost(@RequestBody Map<String, String> data) {
//		String text = data.get("text");
//
//		System.out.println("POST 프론트에서 받은 데이터 : " + text);
//
//		return "POST 프론트에서 받은 데이터 : : " + text;
//	}
