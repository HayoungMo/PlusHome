package com.spring.home;

import java.io.Console;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.UserDTO;
import com.spring.home.service.UserService;

import lombok.RequiredArgsConstructor;

@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/user")
@RestController
public class UserController {
	
	
	private final UserService userService;
	
	//회원가입
	@PostMapping("/join")
	public String join(@RequestBody UserDTO dto) throws Exception {
		
		System.out.println("DTO:" + dto);
		
		 userService.insertData(dto);
		 return "ok";
	}
	
	//아이디 중복검사
	@GetMapping("/check-id")
	public Map<String,Object> checkId(@RequestParam String id) throws Exception{
				
		UserDTO dto = userService.findById(id);
		
		Map<String,Object>  result = new HashMap<>();
		
		if(dto==null) {
			result.put("available", true);
			result.put("message", "사용 가능한 아이디입니다.");
		}else {
			result.put("available", false);
			result.put("message", "이미 있는 아이디입니다.");
		}
			
		return result;
	
	}
	
	//아이디 찾기
	@PostMapping("/find-id")
	public String findId(@RequestBody UserDTO dto) throws Exception {
		return userService.findUserId(dto);
	}
	
	
	
	//로그인
	@PostMapping("/login")
	public Map<String,Object> login(@RequestBody UserDTO dto) throws Exception {
		
		UserDTO user = userService.login(dto);
		
		Map<String,Object> result = new HashMap<>();
		
		if(user==null) {
			result.put("success", false);
			result.put("message", "로그인 실패");
		}else {
			result.put("success", true);
			result.put("user", user);
		}
		
	
		return result;
	}
	
	//회원 수정
	@PostMapping("/update")
	public void updateData(@RequestBody UserDTO dto) throws Exception {
	userService.updateData(dto);
}
	
	//회원 삭제
	@GetMapping("/delete")
	public void deleteData(@RequestParam String id) throws Exception {
		userService.deleteData(id);
	}

}
