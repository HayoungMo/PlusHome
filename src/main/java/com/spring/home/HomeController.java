package com.spring.home;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/testService")
@RestController
public class HomeController {

	@RequestMapping("/testServicePost")
	public String testService(@RequestBody Map<String, String> data) {
		String text = data.get("text");

		// 콘솔 확인
		System.out.println("받은 데이터: " + text);

		// 텍스트 리턴
		return "서버에서 받은 메시지: " + text;
	}
}
