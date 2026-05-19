package com.spring.home;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
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
     public List<FurnitureDTO> getBestFurniture(@RequestParam(defaultValue = "") String id) throws Exception {
	     
		return homeService.getBestFurniture(id);
	}
     //알고리즘 추천 숨김 기능관련
     @GetMapping("/recommend/hidden")
     public List<String> getHiddenFurnitureCodes(@RequestParam String id) throws Exception{
    	 return homeService.getHiddenFurnitureCodes(id);
     }
     
     @PostMapping("/recommend/hide")
     public Map<String, Object> saveHiddenFurniture(@RequestBody Map<String, Object> body) throws Exception{
    	 String id = String.valueOf(body.get("id"));
    	 
    	 @SuppressWarnings("unchecked")
    	 List<String> f_codes = (List<String>) body.get("f_codes");
    	 
    	 homeService.saveHiddenFurniture(id, f_codes);
    	 
    	 Map<String, Object> result = new HashMap<>();
    	 result.put("success", true);
    	 
    	 return result;
    	 
     }
     
     @GetMapping("/search/total")
     public Map<String, Object> searchTotal(@RequestParam(defaultValue = "") String keyword) throws Exception{
    	 return homeService.searchTotal(keyword);
     }
     
     @GetMapping("/search/list")
     public Map<String, Object> searchList(
    		 @RequestParam(defaultValue = "all") String type,
    		 @RequestParam(defaultValue = "") String keyword,
    		 @RequestParam(defaultValue = "1") int pageNum) throws Exception {
    	 return homeService.searchList(type,keyword,pageNum);
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
