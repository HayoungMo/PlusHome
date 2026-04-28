package com.spring.home;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/main")
@RestController
public class HomeController {

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
	
	//test용 api
	@GetMapping("/test")
	public String test() {
		return "저쪽 백에서 보낸 메세지 입니다";
	}
	
}
